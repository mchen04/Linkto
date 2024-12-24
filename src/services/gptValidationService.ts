import OpenAI from 'openai';

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for embeddings
const embeddingCache = new Map<string, number[]>();

// Rate limiting setup
const RATE_LIMIT = {
  maxRequests: 3000, // text-embedding-3-small limit
  windowMs: 60000, // 1 minute
  requests: new Map<string, number>(),
};

// Threshold for considering words related
const SIMILARITY_THRESHOLD = 0.6;

export async function validateCreativeConnection(
  word1: string,
  word2: string
): Promise<{ isValid: boolean; relationship?: string; creativity?: number }> {
  // Check rate limit
  const key = `${word1}-${word2}`;
  const now = Date.now();
  const recentRequests = RATE_LIMIT.requests.get(key) || 0;
  
  if (recentRequests >= RATE_LIMIT.maxRequests) {
    console.warn('Rate limit exceeded for embeddings');
    return { isValid: false };
  }

  try {
    // Get embeddings for both words
    const [embedding1, embedding2] = await Promise.all([
      getEmbedding(word1),
      getEmbedding(word2)
    ]);

    // Calculate cosine similarity
    const similarity = cosineSimilarity(embedding1, embedding2);

    // Determine relationship type and creativity score based on similarity
    if (similarity >= SIMILARITY_THRESHOLD) {
      const creativity = Math.floor(similarity * 20); // Scale to 1-20
      let relationship = 'Semantic';
      
      if (similarity > 0.8) {
        relationship = 'Strong semantic';
      } else if (similarity > 0.7) {
        relationship = 'Metaphorical';
      } else {
        relationship = 'Contextual';
      }

      return {
        isValid: true,
        relationship,
        creativity,
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error('Embedding API error:', error);
    return { isValid: false };
  }
}

async function getEmbedding(word: string): Promise<number[]> {
  // Check cache first
  if (embeddingCache.has(word)) {
    return embeddingCache.get(word)!;
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: word,
    dimensions: 384, // Smaller dimension for efficiency
  });

  const embedding = response.data[0].embedding;
  embeddingCache.set(word, embedding);
  
  return embedding;
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (norm1 * norm2);
} 