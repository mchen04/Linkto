import { useState } from 'react';
import { validateWord } from '../utils/wordValidation';

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
}

const WordInput = () => {
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [relationships, setRelationships] = useState<WordRelationships | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWord = e.target.value;
    setWord(newWord);
    if (error) setError(null);
    if (relationships) setRelationships(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRelationships(null);
    
    try {
      const result = await validateWord(word);
      
      if (!result.isValid) {
        setError(result.error || 'Invalid word');
        return;
      }

      if (result.relationships) {
        setRelationships(result.relationships);
      }
      
    } catch (error) {
      setError('An error occurred while validating the word');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={word}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="Enter a word"
            aria-label="Word input"
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Submit word"
        >
          {isLoading ? 'Validating...' : 'Submit'}
        </button>
      </form>

      {relationships && (
        <div className="mt-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Strict Relationships</h2>
            
            {relationships.strict.synonyms.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Synonyms:</h3>
                <p className="text-gray-600">{relationships.strict.synonyms.join(', ')}</p>
              </div>
            )}
            
            {relationships.strict.antonyms.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Antonyms:</h3>
                <p className="text-gray-600">{relationships.strict.antonyms.join(', ')}</p>
              </div>
            )}
            
            {relationships.strict.contextual.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Contextual Relationships:</h3>
                <p className="text-gray-600">{relationships.strict.contextual.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Creative Relationships</h2>
            
            {relationships.creative.figurative.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Figurative Connections:</h3>
                <p className="text-gray-600">{relationships.creative.figurative.join(', ')}</p>
              </div>
            )}
            
            {relationships.creative.associations.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Free Associations:</h3>
                <p className="text-gray-600">{relationships.creative.associations.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordInput; 