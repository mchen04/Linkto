import React from 'react';

interface WordRelationshipProps {
  previousWord: string;
  currentWord: string;
  relationship?: string;
}

export function WordRelationship({ 
  previousWord, 
  currentWord, 
  relationship 
}: WordRelationshipProps) {
  if (!relationship) return null;

  return (
    <div className="text-xs text-brown-600 text-center mt-1">
      <span className="font-medium">{previousWord}</span>
      {' → '}
      <span className="font-medium">{currentWord}</span>
      <br />
      <span className="italic">{relationship}</span>
    </div>
  );
} 