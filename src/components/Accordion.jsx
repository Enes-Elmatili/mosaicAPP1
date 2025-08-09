/**
 * Accordion.jsx
 * Composant réutilisable d'accordéon pour afficher/réduire le contenu.
 */
import { useState } from 'react';

/**
 * Props:
 * @param {string} question - Texte de la question
 * @param {string} answer   - Contenu de la réponse
 */
export default function Accordion({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
      >
        <span className="font-medium">{question}</span>
        <span
          className={`transform transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className="pb-4 text-gray-700">{answer}</div>}
    </div>
  );
}
