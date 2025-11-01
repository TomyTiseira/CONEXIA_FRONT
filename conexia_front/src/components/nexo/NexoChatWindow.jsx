'use client';

import { useRef, useEffect } from 'react';
import NexoHeader from './NexoHeader';
import NexoMessage from './NexoMessage';
import NexoInput from './NexoInput';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function NexoChatWindow({
  messages,
  isLoading,
  isConnected,
  isTyping,
  error,
  onSendMessage,
  onMinimize,
  onReconnect,
  onAvatarClick,
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll a último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
      {/* Header */}
      <NexoHeader
        onMinimize={onMinimize}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
        style={{ maxHeight: 'calc(100% - 140px)' }}
      >
        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Cargando NEXO...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 p-6 m-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={32} className="text-red-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-red-800 mb-2">Error de conexión</p>
              <p className="text-xs text-red-600 mb-4">{error}</p>
              <button
                onClick={onReconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm 
                           rounded-lg hover:bg-red-700 transition-colors mx-auto"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {!isLoading && !error && (
          <>
            {messages.map((message) => (
              <NexoMessage 
                key={message.id} 
                message={message} 
                onAvatarClick={onAvatarClick}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 mb-4">
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
                <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                <div className="group relative">
                  <button 
                    onClick={onAvatarClick}
                    className="text-6xl hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    🦊
                  </button>
                  {/* Tooltip elegante */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs 
                                  rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap
                                  pointer-events-none shadow-lg z-10">
                    Acerca de mí
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ¡Hola! Soy NEXO
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tu asistente virtual de CONEXIA.<br />
                    ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <NexoInput
        onSend={onSendMessage}
        disabled={!isConnected || isLoading}
        placeholder={
          !isConnected
            ? 'Conectando...'
            : isLoading
            ? 'Cargando...'
            : 'Escribe tu mensaje...'
        }
      />
    </div>
  );
}
