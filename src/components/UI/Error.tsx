import React from 'react';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorProps> = ({ message, onRetry }) => (
  <div className="text-center py-6 text-red-600">
    <p>Erreur : {message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 text-primary-600 hover:underline">
        Réessayer
      </button>
    )}
  </div>
);
