import { isValidWord as checkDictionary, getWordDefinition } from '../services/dictionaryService';
import { WordEmbeddingService } from '../services/wordEmbeddingService';
import { findConceptualRelationship } from '../services/conceptNetService';
import { validateCreativeConnection } from '../services/gptValidationService';

const wordEmbeddingService = new WordEmbeddingService();

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  creativityScore?: number;
  relationship?: string;
  isDirectJump?: boolean;
}

interface ValidationRule {
  validate: (prev: string, current: string, isTargetWord: boolean) => Promise<ValidationResult>;
  priority: number;
}

// Helper function to check semantic relationships
async function findSemanticRelationship(word1: string, word2: string) {
  // 1. Try dictionary-based synonyms/antonyms first
  const dictResult = await checkDictionaryRelations(word1, word2);
  if (dictResult) return dictResult;

  // 2. Check word embeddings similarity
  const similarity = await wordEmbeddingService.getWordSimilarity(word1, word2);
  if (similarity > 0.6) {
    return {
      type: 'Semantic',
      isValid: true,
      creativity: Math.floor(similarity * 15)
    };
  }

  // 3. Check ConceptNet for conceptual relationships
  const conceptualRelation = await findConceptualRelationship(word1, word2);
  if (conceptualRelation?.isValid) {
    return {
      type: conceptualRelation.type,
      isValid: true,
      creativity: Math.floor(conceptualRelation.strength * 15)
    };
  }

  // 4. Fallback to GPT for creative relationships
  const creativeRelation = await validateCreativeConnection(word1, word2);
  if (creativeRelation.isValid) {
    return {
      type: creativeRelation.relationship || 'Creative',
      isValid: true,
      creativity: creativeRelation.creativity || 15
    };
  }

  return null;
}

const rules: ValidationRule[] = [
  {
    // Dictionary validation
    priority: 1,
    validate: async (prev: string, current: string) => {
      const isValid = await checkDictionary(current);
      if (!isValid) {
        return {
          isValid: false,
          reason: 'Word not found in dictionary',
        };
      }
      return { isValid: true };
    },
  },
  {
    // No repetition
    priority: 2,
    validate: async (prev: string, current: string) => {
      if (current === prev) {
        return {
          isValid: false,
          reason: 'Cannot use the same word twice',
        };
      }
      return { isValid: true };
    },
  },
  {
    // Combined letter sharing and semantic validation
    priority: 3,
    validate: async (prev: string, current: string, isTargetWord: boolean) => {
      // First check for semantic relationships
      const semanticRelation = await findSemanticRelationship(prev, current);
      
      if (semanticRelation?.isValid) {
        return {
          isValid: true,
          relationship: `${semanticRelation.type} relationship`,
          creativityScore: semanticRelation.creativity || 15,
          isDirectJump: isTargetWord,
        };
      }

      // If no semantic relationship, check for letter sharing
      const prevLetters = new Set(prev.split(''));
      const commonLetters = current.split('').filter(letter => prevLetters.has(letter));
      
      if (commonLetters.length >= 4) {
        return {
          isValid: true,
          relationship: `Share letters: ${commonLetters.join(', ')}`,
          creativityScore: commonLetters.length > 4 ? 10 : 5,
          isDirectJump: isTargetWord,
        };
      }

      return {
        isValid: false,
        reason: 'Words must either share at least 4 letters or have a valid relationship',
      };
    },
  },
];

// Cache for validated connections
const validationCache = new Map<string, ValidationResult>();

export async function validateWordConnection(
  previousWord: string,
  currentWord: string,
  isTargetWord: boolean = false
): Promise<ValidationResult> {
  const prev = previousWord.toLowerCase().trim();
  const current = currentWord.toLowerCase().trim();
  
  const cacheKey = `${prev}-${current}-${isTargetWord}`;
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)!;
  }

  for (const rule of rules) {
    const result = await rule.validate(prev, current, isTargetWord);
    if (!result.isValid) {
      return result;
    }
  }

  const result = await rules[rules.length - 1].validate(prev, current, isTargetWord);
  validationCache.set(cacheKey, result);
  return result;
} 