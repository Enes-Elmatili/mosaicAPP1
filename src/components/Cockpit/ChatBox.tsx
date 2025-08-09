import React, { useState } from 'react';

/**
 * ChatBox for live instructions and code patching.
 */
export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);

  const send = () => {
    if (!input) return;
    setMessages(prev => [...prev, { from: 'You', text: input }]);
    setInput('');
    setMessages(prev => [...prev, { from: 'AI', text: 'Réponse IA en cours...' }]);
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">AI ChatBox</h2>
      <div className="flex-1 bg-gray-50 rounded p-4 overflow-auto space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className="">
            <strong>{m.from}: </strong>{m.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          className="flex-1 border border-gray-300 rounded-l px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tapez votre message..."
        />
        <button onClick={send} className="bg-primary-600 text-white px-4 rounded-r">
          Envoyer
        </button>
      </div>
    </div>
  );
}
