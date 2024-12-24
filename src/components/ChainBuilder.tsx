import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ChainBuilderProps {
  startWord: string;
  endWord: string;
  onSubmit: (chain: string[]) => void;
}

export function ChainBuilder({ startWord, endWord, onSubmit }: ChainBuilderProps) {
  const [words, setWords] = useState<string[]>([startWord]);
  const [currentWord, setCurrentWord] = useState('');

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWord.trim()) {
      setWords([...words, currentWord.trim().toLowerCase()]);
      setCurrentWord('');
    }
  };

  const handleSubmitChain = () => {
    if (words[words.length - 1] === endWord) {
      onSubmit(words);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4 py-6">
        {words.map((word, index) => (
          <div key={index} className="flex items-center">
            <div className={`px-4 py-2 rounded ${
              index === 0 || index === words.length - 1 
                ? 'bg-orange-100 border-2 border-orange-800 text-orange-900'
                : 'bg-amber-50 border-2 border-brown-800 text-brown-900'
            }`}>
              {word}
            </div>
            {index < words.length - 1 && (
              <ArrowRight className="text-brown-600 ml-4" />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAddWord} className="flex items-center space-x-2">
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-amber-50 border-2 border-brown-800 text-brown-900 focus:ring-2 focus:ring-orange-500 focus:border-brown-800"
          placeholder="Enter next word..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-orange-100 text-orange-900 border-2 border-orange-800 rounded hover:bg-orange-200 transition-colors"
        >
          Add Word
        </button>
      </form>

      <button
        onClick={handleSubmitChain}
        disabled={words[words.length - 1] !== endWord}
        className="w-full px-4 py-3 bg-emerald-100 text-emerald-900 border-2 border-emerald-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>Complete Chain</span>
      </button>
    </div>
  );
}