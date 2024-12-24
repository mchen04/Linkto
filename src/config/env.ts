export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
};

// Validate environment variables
export function validateEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
} 