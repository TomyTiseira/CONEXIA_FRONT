import { useState, useCallback, useEffect, useRef } from 'react';
import { useNexoWebSocket } from './useNexoWebSocket';
import { initializeNexoChat, getNexoMessages } from '@/service/nexo/nexoService';

/**
 * Hook principal para la lógica de negocio del chat NEXO
 */
export function useNexoChat() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [initError, setInitError] = useState(null);
  
  const { isConnected, error: wsError, connect, disconnect, emit, on, off } = useNexoWebSocket();
  const isInitializedRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Cargar historial
  const loadHistory = useCallback(async (convId) => {
    try {
      const data = await getNexoMessages(convId);
      
      if (data.data && Array.isArray(data.data)) {
        // Ordenar por fecha (más antiguos primero)
        const sortedMessages = data.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Error cargando historial de NEXO:', err);
      setInitError(err.message || 'Error al cargar historial');
    }
  }, []);

  // Inicializar chat
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    try {
      setIsLoading(true);
      setInitError(null);
      
      // 1. Inicializar chat
      const initData = await initializeNexoChat();
      setConversationId(initData.conversationId);
      setHasHistory(initData.hasHistory);
      
      // 2. Si hay greeting, mostrarlo
      if (initData.greeting) {
        setMessages([{
          id: `greeting-${Date.now()}`,
          content: initData.greeting,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        }]);
      }
      
      // 3. Si hay historial, cargarlo
      if (initData.hasHistory && initData.conversationId) {
        await loadHistory(initData.conversationId);
      }
      
      // 4. Conectar WebSocket
      connect();
      
      isInitializedRef.current = true;
    } catch (err) {
      console.error('Error inicializando NEXO:', err);
      setInitError(err.message || 'No se pudo inicializar NEXO');
    } finally {
      setIsLoading(false);
    }
  }, [connect, loadHistory]);

  // Enviar mensaje
  const sendMessage = useCallback((content) => {
    if (!content || !content.trim()) return;
    if (!isConnected) {
      setInitError('NEXO no está conectado');
      return;
    }
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    
    // Agregar mensaje del usuario inmediatamente
    setMessages(prev => [...prev, userMessage]);
    
    // Enviar al servidor
    const success = emit('message', { message: content.trim() });
    
    if (!success) {
      setInitError('No se pudo enviar el mensaje');
    }
  }, [isConnected, emit]);

  // Manejar respuesta del asistente
  useEffect(() => {
    if (!isConnected) return;
    
    const handleAssistantMessage = (data) => {
      setIsTyping(false);
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        content: data.message,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        conversationId: data.conversationId,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Actualizar conversationId si viene en la respuesta
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
    };
    
    on('assistantMessage', handleAssistantMessage);
    
    return () => {
      off('assistantMessage', handleAssistantMessage);
    };
  }, [isConnected, on, off, conversationId]);

  // Simular indicador de "escribiendo" al recibir mensaje
  useEffect(() => {
    if (!isConnected) return;
    
    const handleMessageSent = () => {
      setIsTyping(true);
      
      // Limpiar timeout anterior si existe
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Timeout de seguridad: quitar typing después de 30s
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 30000);
    };
    
    // Cuando enviamos mensaje, mostrar typing
    const originalEmit = emit;
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isConnected, emit]);

  // Limpiar en unmount
  useEffect(() => {
    return () => {
      disconnect();
      isInitializedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [disconnect]);

  return {
    messages,
    conversationId,
    isLoading,
    isConnected,
    isTyping,
    hasHistory,
    error: initError || wsError,
    initialize,
    sendMessage,
    disconnect,
  };
}
