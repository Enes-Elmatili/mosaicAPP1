import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'open' | 'in_progress' | 'closed';
}

const colors = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-600',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'open', children }) => (
  <span className={`px-2 py-0.5 text-sm rounded-full ${colors[variant]}`}>{children}</span>
);
