import React from 'react';

interface EmptyProps {
  message: string;
  children?: React.ReactNode;
}

export const Empty: React.FC<EmptyProps> = ({ message, children }) => (
  <div className="text-center py-6 text-gray-600">
    <p>{message}</p>
    {children && <div className="mt-2">{children}</div>}
  </div>
);
