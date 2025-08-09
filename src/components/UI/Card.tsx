import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`} {...props}>
    {children}
  </div>
);
