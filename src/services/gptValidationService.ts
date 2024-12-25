import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface WordConnectionValidation {
  isValid: boolean;
  relationshipType?: 'synonym' | 'antonym' | 'contextual' | 'figurative' | 'creative';
  creativity?: number;
}

export const validateWithGpt = async (word1: string, word2: string): Promise<WordConnectionValidation> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a linguistic expert. Analyze word relationships and respond in JSON format."
        },
        {
          role: "user",
          content: `Analyze the relationship between "${word1}" and "${word2}". 
          Determine if there's a valid connection and categorize it.
          Creativity scores:
          - Synonym: 5
          - Antonym: 7
          - Contextual: 10
          - Figurative: 15
          - Creative: 20
          
          Respond only with:
          {
            "isValid": boolean,
            "relationshipType": "synonym|antonym|contextual|figurative|creative",
            "creativity": number
          }`
        }
      ],
      temperature: 0.5,
      max_tokens: 100,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      isValid: response.isValid,
      relationshipType: response.relationshipType,
      creativity: response.creativity
    };
  } catch (error) {
    console.error('GPT validation error:', error);
    return {
      isValid: false
    };
  }
}; 