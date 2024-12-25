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
}

export const validateWordConnection = async (
  word1: string, 
  word2: string,
  currentChain?: string[]
): Promise<WordConnectionResult> => {
  try {
    // Check if it's a direct jump
    const isDirectJump = currentChain && currentChain.length > 0 && 
      currentChain[currentChain.length - 1] !== word1;

    // Validate with GPT
    const validation = await validateWithGpt(word1, word2);

    if (validation.isValid) {
      return {
        isValid: true,
        relationship: validation.relationshipType,
        creativity: validation.creativity,
        isDirectJump
      };
    }

    return { 
      isValid: false
    };
  } catch (error) {
    console.error('Error validating word connection:', error);
    return { 
      isValid: false
    };
  }
}; 