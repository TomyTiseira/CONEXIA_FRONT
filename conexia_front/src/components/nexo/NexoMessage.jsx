'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NexoMessage({ message, onAvatarClick }) {
  const isAssistant = message.role === 'assistant';
  
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 animate-slideIn`}>
      <div className={`max-w-[80%] ${isAssistant ? 'order-2' : 'order-1'}`}>
        {isAssistant && (
          <div className="flex items-center gap-2 mb-1">
            <div className="group relative">
              <button 
                onClick={onAvatarClick}
                className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
              >
                🦊
              </button>
              {/* Tooltip elegante */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs 
                              rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap
                              pointer-events-none shadow-lg">
                Acerca de mí
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1" />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600">NEXO</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isAssistant
              ? 'bg-gray-100 text-gray-800 rounded-tl-none'
              : 'bg-blue-600 text-white rounded-tr-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        {message.createdAt && (
          <p className={`text-xs text-gray-500 mt-1 ${isAssistant ? 'text-left' : 'text-right'}`}>
            {formatTime(message.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}
