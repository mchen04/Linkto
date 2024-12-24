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

// Basic validation rules
const rules: ValidationRule[] = [
  {
    priority: 1,
    validate: async (prev: string, current: string) => {
      // Check if the word exists in dictionary
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
    priority: 3,
    validate: async (prev: string, current: string, isTargetWord: boolean) => {
      // Check for direct semantic relationship
      const relationship = await findWordRelationship(prev, current);
      
      if (relationship) {
        return {
          isValid: true,
          relationship,
          creativityScore: 10,
          isDirectJump: isTargetWord,
        };
      }

      // Fallback to letter sharing if no semantic relationship found
      const prevLetters = new Set(prev.split(''));
      const commonLetters = current.split('').filter(letter => prevLetters.has(letter));
      
      if (commonLetters.length < 2) {
        return {
          isValid: false,
          reason: 'Words must share at least 2 letters or have a clear relationship',
        };
      }

      return {
        isValid: true,
        relationship: `Share letters: ${commonLetters.join(', ')}`,
        creativityScore: 5,
        isDirectJump: false,
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

// Add semantic relationship checking
async function findSemanticRelationship(word1: string, word2: string): Promise<string | null> {
  try {
    const def1 = await getWordDefinition(word1);
    const def2 = await getWordDefinition(word2);
    
    if (!def1 || !def2) return null;

    // Check for direct synonyms/antonyms
    for (const meaning1 of def1.meanings) {
      for (const def of meaning1.definitions) {
        if (def.synonyms.includes(word2)) {
          return 'Synonym';
        }
        if (def.antonyms.includes(word2)) {
          return 'Antonym';
        }
      }
    }

    // Check if one word appears in the other's definition
    const word1InDef2 = def2.meanings.some(meaning =>
      meaning.definitions.some(def =>
        def.definition.toLowerCase().includes(word1.toLowerCase())
      )
    );

    const word2InDef1 = def1.meanings.some(meaning =>
      meaning.definitions.some(def =>
        def.definition.toLowerCase().includes(word2.toLowerCase())
      )
    );

    if (word1InDef2 || word2InDef1) {
      return 'Related by definition';
    }

    return null;
  } catch (error) {
    console.error('Error finding semantic relationship:', error);
    return null;
  }
}

// Update the findWordRelationship function
export async function findWordRelationship(
  word1: string,
  word2: string
): Promise<string | null> {
  // First try to find semantic relationship
  const semanticRelation = await findSemanticRelationship(word1, word2);
  if (semanticRelation) return semanticRelation;

  // Fallback to letter sharing check
  const commonLetters = word1.split('').filter(letter => word2.includes(letter));
  if (commonLetters.length >= 2) {
    return `Share letters: ${commonLetters.join(', ')}`;
  }

  return null;
} 