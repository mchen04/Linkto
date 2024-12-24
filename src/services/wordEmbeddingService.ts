import { load } from '@tensorflow-models/universal-sentence-encoder';

export class WordEmbeddingService {
  private model: any = null;

  async initialize() {
    this.model = await load();
  }

  async getWordSimilarity(word1: string, word2: string): Promise<number> {
    if (!this.model) await this.initialize();
    
    const embeddings = await this.model.embed([word1, word2]);
    const similarity = await this.cosineSimilarity(
      embeddings.arraySync()[0],
      embeddings.arraySync()[1]
    );
    
    return similarity;
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (norm1 * norm2);
  }
} 