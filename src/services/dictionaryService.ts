const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface DictionaryEntry {
  word: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

interface CacheEntry {
  isValid: boolean;
  timestamp: number;
}

class DictionaryCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  constructor(maxSize = 1000, ttlHours = 24) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlHours * 60 * 60 * 1000;
  }

  get(word: string): boolean | null {
    const entry = this.cache.get(word);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(word);
      return null;
    }

    return entry.isValid;
  }

  set(word: string, isValid: boolean): void {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entriesToRemove = Math.ceil(this.maxSize * 0.2); // Remove 20% of oldest entries
      const entries = Array.from(this.cache.entries());
      entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entriesToRemove)
        .forEach(([key]) => this.cache.delete(key));
    }

    this.cache.set(word, {
      isValid,
      timestamp: Date.now(),
    });
  }

  // Optional: Save cache to localStorage
  persist(): void {
    try {
      localStorage.setItem('dictionary_cache', JSON.stringify(Array.from(this.cache.entries())));
    } catch (error) {
      console.warn('Failed to persist dictionary cache:', error);
    }
  }

  // Optional: Load cache from localStorage
  load(): void {
    try {
      const saved = localStorage.getItem('dictionary_cache');
      if (saved) {
        this.cache = new Map(JSON.parse(saved));
        // Clean up expired entries
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load dictionary cache:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [word, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(word);
      }
    }
  }
}

// Create singleton instance
const dictionaryCache = new DictionaryCache();

// Load cached data on initialization
dictionaryCache.load();

// Save cache before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    dictionaryCache.persist();
  });
}

export async function isValidWord(word: string): Promise<boolean> {
  const normalizedWord = word.toLowerCase().trim();
  
  // Check cache first
  const cachedResult = dictionaryCache.get(normalizedWord);
  if (cachedResult !== null) {
    return cachedResult;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(normalizedWord)}`);
    const isValid = response.ok;
    
    // Cache the result
    dictionaryCache.set(normalizedWord, isValid);
    
    return isValid;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return false;
  }
}

export async function getWordDefinition(word: string): Promise<DictionaryEntry | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data[0] as DictionaryEntry;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return null;
  }
} 