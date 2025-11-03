'use client';

import { useState, useEffect } from 'react';
import { useNexoChat } from '@/hooks/nexo/useNexoChat';
import { useAuth } from '@/context/AuthContext';
import { useChatWidgets } from '@/context/ChatWidgetsContext';
import NexoIcon from './NexoIcon';
import NexoChatWindow from './NexoChatWindow';
import NexoAboutModal from './NexoAboutModal';
import Toast from '@/components/ui/Toast';

export default function NexoChat() {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { user } = useAuth();
  const { nexoOpen, messagingOpen, openNexo, closeNexo } = useChatWidgets();

  const {
    messages,
    isLoading,
    isConnected,
    isTyping,
    error,
    socketError,
    tokenRefreshed,
    initialize,
    sendMessage,
    disconnect,
  } = useNexoChat();

  // Solo mostrar NEXO si el usuario está autenticado
  const shouldShow = !!user;

  // Inicializar cuando el componente se abre
  useEffect(() => {
    if (nexoOpen && !isLoading && messages.length === 0) {
      initialize().catch((err) => {
        setToast({
          type: 'error',
          message: err.message || 'No se pudo inicializar NEXO',
          isVisible: true,
        });
      });
    }
  }, [nexoOpen, isLoading, messages.length, initialize]);

  // Mostrar notificación de nuevo mensaje cuando está minimizado
  useEffect(() => {
    if (!nexoOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setHasNewMessage(true);
      }
    } else {
      setHasNewMessage(false);
    }
  }, [messages, nexoOpen]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleToggle = () => {
    if (nexoOpen) {
      closeNexo();
    } else {
      openNexo();
    }
    setHasNewMessage(false);
  };

  const handleClose = () => {
    closeNexo();
    disconnect();
  };

  const handleSendMessage = (content) => {
    try {
      sendMessage(content);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Error al enviar mensaje',
        isVisible: true,
      });
    }
  };

  const handleReconnect = () => {
    initialize().catch((err) => {
      setToast({
        type: 'error',
        message: err.message || 'No se pudo reconectar',
        isVisible: true,
      });
    });
  };

  const handleAvatarClick = () => {
    setShowAboutModal(true);
  };

  // Mostrar error con toast
  useEffect(() => {
    if (error && nexoOpen) {
      setToast({
        type: 'error',
        message: error,
        isVisible: true,
      });
    }
  }, [error, nexoOpen]);

  // Manejar eventos estructurados desde socket (auth_error, refresh failures, etc.)
  useEffect(() => {
    if (!socketError || !nexoOpen) return;

    const code = socketError.code;

    switch (code) {
      case 'refresh_token_expired':
        setToast({ type: 'error', message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', isVisible: true });
        // Cerrar y redirigir al login
        setTimeout(() => {
          window.location.href = '/login?reason=session_expired';
        }, 2000);
        break;

      case 'no_tokens':
      case 'no_valid_tokens':
        setToast({ type: 'error', message: 'No se encontró sesión activa. Por favor, inicia sesión.', isVisible: true });
        setTimeout(() => {
          window.location.href = '/login?reason=no_session';
        }, 1500);
        break;

      case 'refresh_timeout':
      case 'refresh_failed':
        setToast({ type: 'error', message: 'Error temporal al renovar la sesión. Reintentando...', isVisible: true });
        // Intentar reconectar/reenviar inicialización
        setTimeout(() => {
          initialize().catch(() => {});
        }, 3000);
        break;

      default:
        // Mostrar mensaje genérico si existe
        setToast({ type: 'error', message: socketError.message || 'Error de autenticación', isVisible: true });
    }
  }, [socketError, nexoOpen, initialize]);

  // Mostrar notificación cuando token sea renovado por socket
  useEffect(() => {
    if (!tokenRefreshed || !nexoOpen) return;

    setToast({
      type: 'info',
      message: tokenRefreshed.message || 'Sesión renovada automáticamente',
      isVisible: true,
    });
  }, [tokenRefreshed, nexoOpen]);

  if (!shouldShow) return null;

  return (
    <>
      {/* Floating Icon - Posicionado en esquina inferior derecha */}
      <div
        className={`fixed transition-all duration-500 ease-in-out ${
          nexoOpen ? 'hidden sm:hidden' : ''
        } ${
          messagingOpen 
            ? 'bottom-16 right-8 sm:right-8 opacity-50 hover:opacity-100 scale-90' 
            : 'bottom-16 right-8 sm:right-8 opacity-100 scale-100'
        } z-40`}
      >
        <NexoIcon
          onClick={handleToggle}
          hasNewMessage={hasNewMessage}
          isMinimized={!nexoOpen}
        />
      </div>

      {/* Chat Window */}
      {nexoOpen && (
        <div
          className="fixed z-45 transition-all duration-500 ease-in-out animate-slideUp
                     bottom-0 right-0 w-full h-full
                     sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[500px]
                     sm:rounded-2xl overflow-hidden shadow-2xl"
        >
          <NexoChatWindow
            messages={messages}
            isLoading={isLoading}
            isConnected={isConnected}
            isTyping={isTyping}
            error={error}
            onSendMessage={handleSendMessage}
            onMinimize={closeNexo}
            onClose={handleClose}
            onReconnect={handleReconnect}
            onAvatarClick={handleAvatarClick}
          />
        </div>
      )}

      {/* About Modal */}
      <NexoAboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="bottom-right"
        />
      )}
    </>
  );
}
