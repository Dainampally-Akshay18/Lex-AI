import { useState, useEffect } from 'react';

const AI_LOADING_QUOTES = [
  "Vectorizing your query...",
  "Searching the vector space for relevant context...",
  "Computing cosine similarity...",
  "Retrieving policy clauses and chunks...",
  "Grounding the response in factual data...",
  "Generating context-aware reasoning...",
  "Orchestrating agentic workflows...",
  "Aligning neural embeddings...",
  "Synthesizing the final decision..."
];

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  useEffect(() => {
    // Change the quote every 2.5 seconds
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % AI_LOADING_QUOTES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center p-4">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-600 ${sizeClasses[size]}`}
      ></div>
      <p className="text-sm font-medium text-gray-600 animate-pulse min-h-[1.5rem]">
        {AI_LOADING_QUOTES[quoteIndex]}
      </p>
    </div>
  );
}