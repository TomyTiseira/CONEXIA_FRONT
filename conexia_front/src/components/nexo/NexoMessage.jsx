'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          {isAssistant ? (
            <div className="text-sm markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Estilos para elementos Markdown
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                  code: ({ inline, children }) => 
                    inline 
                      ? <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                      : <code className="block bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-400 pl-3 italic my-2 text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
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
