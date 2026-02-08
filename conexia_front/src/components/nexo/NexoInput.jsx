'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function NexoInput({ onSend, disabled, placeholder = "Escribe tu mensaje..." }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     max-h-32 overflow-y-auto"
          style={{ minHeight: '40px' }}
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all
                     ${
                       disabled || !input.trim()
                         ? 'bg-gray-300 cursor-not-allowed'
                         : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                     }`}
          title="Enviar mensaje"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
