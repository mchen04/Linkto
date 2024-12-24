import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface GptRelationships {
  strict: {
    synonyms: string[];
    antonyms: string[];
    contextual: string[];
  };
  creative: {
    figurative: string[];
    associations: string[];
  };
}

export const validateWithGpt = async (word: string): Promise<GptRelationships> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a linguistic expert. Respond only in JSON format with arrays of strings for each category."
        },
        {
          role: "user",
          content: `Analyze the word "${word}" and provide relationships in the following JSON structure:
{
  "strict": {
    "synonyms": [],
    "antonyms": [],
    "contextual": []
  },
  "creative": {
    "figurative": [],
    "associations": []
  }
}
Keep responses concise with 3-5 items per category.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GPT');
    }

    return JSON.parse(response) as GptRelationships;

  } catch (error) {
    console.error('GPT validation error:', error);
    // Return empty arrays if there's an error
    return {
      strict: {
        synonyms: [],
        antonyms: [],
        contextual: []
      },
      creative: {
        figurative: [],
        associations: []
      }
    };
  }
}; 