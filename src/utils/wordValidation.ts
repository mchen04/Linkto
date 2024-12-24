import { isValidWord as checkDictionary, getWordDefinition } from '../services/dictionaryService';

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
async function findSemanticRelationship(word1: string, word2: string): Promise<{
  type: string;
  isValid: boolean;
} | null> {
  try {
    const def1 = await getWordDefinition(word1);
    const def2 = await getWordDefinition(word2);
    
    if (!def1 || !def2) return null;

    // Check for synonyms/antonyms (strict validation)
    for (const meaning1 of def1.meanings) {
      for (const def of meaning1.definitions) {
        if (def.synonyms.includes(word2)) {
          return { type: 'Synonym', isValid: true };
        }
        if (def.antonyms.includes(word2)) {
          return { type: 'Antonym', isValid: true };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding semantic relationship:', error);
    return null;
  }
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
          relationship: semanticRelation.type,
          creativityScore: 15, // Higher score for semantic relationships
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
        reason: 'Words must either share at least 4 letters or have a semantic relationship',
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