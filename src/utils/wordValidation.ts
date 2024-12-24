import { isValidWord as checkDictionary } from '../services/dictionaryService';
import { validateWithGpt } from '../services/gptValidationService';
import { RelationshipCache } from '../services/relationshipCache';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  relationships?: {
    strict: {
      synonyms: string[];
      antonyms: string[];
      contextual: string[];
    };
    creative: {
      figurative: string[];
      associations: string[];
    };
  };
}

export const validateWord = async (word: string): Promise<ValidationResult> => {
  if (!word) {
    return {
      isValid: false,
      error: "Word cannot be empty"
    };
  }

  const cleanWord = word.trim().toLowerCase();

  if (!/^[a-zA-Z]+$/.test(cleanWord)) {
    return {
      isValid: false,
      error: "Word must contain only letters"
    };
  }

  try {
    // Check if word exists in dictionary
    const isValidDictionaryWord = await checkDictionary(cleanWord);
    if (!isValidDictionaryWord) {
      return {
        isValid: false,
        error: "Word not found in dictionary"
      };
    }

    // Check cache first
    const cachedRelationships = RelationshipCache.getRelationships(cleanWord);
    if (cachedRelationships) {
      return {
        isValid: true,
        relationships: cachedRelationships
      };
    }

    // If not in cache, validate with GPT
    const gptRelationships = await validateWithGpt(cleanWord);

    // Store in cache
    RelationshipCache.setRelationships(cleanWord, gptRelationships);

    return {
      isValid: true,
      relationships: gptRelationships
    };

  } catch (error) {
    console.error('Error validating word:', error);
    return {
      isValid: false,
      error: "Error validating word relationships"
    };
  }
};

export interface WordConnectionResult {
  isValid: boolean;
  relationship?: string;
  creativity?: number;
  isDirectJump?: boolean;
  reason?: string;
}

export const validateWordConnection = async (
  word1: string, 
  word2: string,
  currentChain?: string[]
): Promise<WordConnectionResult> => {
  try {
    const word1Relations = await validateWord(word1);

    // Check if it's a direct jump (skipping words)
    const isDirectJump = currentChain && currentChain.length > 0 && 
      currentChain[currentChain.length - 1] !== word1;

    // Check if word2 appears in any of word1's relationships
    const allWord1Relations = [
      ...word1Relations.relationships?.strict.synonyms || [],
      ...word1Relations.relationships?.strict.antonyms || [],
      ...word1Relations.relationships?.strict.contextual || [],
      ...word1Relations.relationships?.creative.figurative || [],
      ...word1Relations.relationships?.creative.associations || []
    ];

    if (allWord1Relations.includes(word2)) {
      // Determine relationship type and creativity score
      if (word1Relations.relationships?.strict.synonyms.includes(word2)) {
        return { 
          isValid: true, 
          relationship: 'synonym', 
          creativity: 5,
          isDirectJump,
          reason: 'Synonym connection found'
        };
      }
      if (word1Relations.relationships?.strict.antonyms.includes(word2)) {
        return { 
          isValid: true, 
          relationship: 'antonym', 
          creativity: 7,
          isDirectJump,
          reason: 'Antonym connection found'
        };
      }
      if (word1Relations.relationships?.strict.contextual.includes(word2)) {
        return { 
          isValid: true, 
          relationship: 'contextual', 
          creativity: 10,
          isDirectJump,
          reason: 'Contextual connection found'
        };
      }
      if (word1Relations.relationships?.creative.figurative.includes(word2)) {
        return { 
          isValid: true, 
          relationship: 'figurative', 
          creativity: 15,
          isDirectJump,
          reason: 'Figurative connection found'
        };
      }
      if (word1Relations.relationships?.creative.associations.includes(word2)) {
        return { 
          isValid: true, 
          relationship: 'association', 
          creativity: 20,
          isDirectJump,
          reason: 'Creative association found'
        };
      }
    }

    return { 
      isValid: false,
      reason: 'No valid connection found between words'
    };
  } catch (error) {
    console.error('Error validating word connection:', error);
    return { 
      isValid: false,
      reason: 'Error occurred while validating connection'
    };
  }
}; 