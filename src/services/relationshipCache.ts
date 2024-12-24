interface WordRelationships {
  strict: {
    synonyms: string[];
    antonyms: string[];
    contextual: string[];
  };
  creative: {
    figurative: string[];
    associations: string[];
  };
  timestamp: number;
}

export class RelationshipCache {
  private static cache: Map<string, WordRelationships> = new Map();
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getRelationships(word: string): WordRelationships | null {
    const cached = this.cache.get(word);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(word);
      return null;
    }

    return cached;
  }

  static setRelationships(word: string, relationships: Omit<WordRelationships, 'timestamp'>) {
    this.cache.set(word, {
      ...relationships,
      timestamp: Date.now()
    });
  }
} 