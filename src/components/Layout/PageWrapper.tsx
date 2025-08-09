import React, { ReactNode } from 'react';

/**
 * PageWrapper provides consistent page layout with title and content container,
 * matching a clean, spacious design inspired by Airbnb and Apple.
 */
const PageWrapper: React.FC<{ title: string; children?: ReactNode }> = ({ title, children }) => (
  <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
    <h1 className="text-4xl font-semibold text-gray-900 mb-6">{title}</h1>
    <div className="space-y-6">{children}</div>
  </div>
);

export default PageWrapper;
