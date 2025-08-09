import React from 'react';

/**
 * Code Explorer: read-only code viewer
 */
export default function CodeExplorer() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Code Explorer</h2>
      <div className="bg-gray-100 p-4 rounded h-96 overflow-auto">
        <p className="text-gray-500">Aucun fichier à afficher pour le moment.</p>
      </div>
    </div>
  );
}
