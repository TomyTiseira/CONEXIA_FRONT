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
  const greetingRef = useRef(null);
  
  const { isConnected, error: wsError, tokenRefreshed, connect, disconnect, emit, on, off } = useNexoWebSocket();
  const isInitializedRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const isConnectedRef = useRef(isConnected);

  // Mantener ref sincronizada con isConnected
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Cargar historial
  const loadHistory = useCallback(async (convId) => {
    try {
  const data = await getNexoMessages(convId);
      
      if (data.data && Array.isArray(data.data)) {
        // Ordenar por fecha (más antiguos primero)
        const sortedMessages = data.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        // Return sorted messages so caller can decide how to merge greeting
        return sortedMessages;
      }
      return [];
    } catch (err) {
      console.error('Error cargando historial de NEXO:', err);
      setInitError(err.message || 'Error al cargar historial');
      return [];
    }
  }, []);

  // Inicializar chat
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    try {
      setIsLoading(true);
      setInitError(null);
      // 1. Primero: conectar el socket para que el servidor pueda enviar eventos de auth/refresh
      connect();

      // Esperar hasta 5s a que el socket quede conectado
      const waitForConnection = () => new Promise((resolve, reject) => {
        const timeout = 5000;
        const start = Date.now();

        const iv = setInterval(() => {
          if (isConnectedRef.current) {
            clearInterval(iv);
            resolve(true);
            return;
          }
          if (Date.now() - start > timeout) {
            clearInterval(iv);
            reject(new Error('socket_timeout'));
          }
        }, 100);
      });

      try {
        await waitForConnection();
      } catch (err) {
        setInitError('No se pudo establecer la conexión con el servidor de chat');
        return;
      }

      // 2. Inicializar chat (endpoint) una vez que el socket está conectado
      const initData = await initializeNexoChat();

      // Algunas APIs devuelven el payload dentro de `data`.
      const payload = initData?.data || initData;

  setConversationId(payload?.conversationId || null);
  setHasHistory(Boolean(payload?.hasHistory));

      // 2. Si hay greeting, guardarlo temporalmente (se fusionará con el historial)
      const greetingText = payload?.greeting || initData?.greeting;
      if (greetingText) {
        greetingRef.current = {
          id: `greeting-${Date.now()}`,
          content: greetingText,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        };
      }

  // debug logs removed
      // 3. Si hay historial, cargarlo y fusionarlo con el greeting (si existe)
      if (payload.hasHistory && payload.conversationId) {
  const hist = await loadHistory(payload.conversationId);

        // Evitar duplicado si la primera entrada del historial es el mismo saludo
        if (greetingRef.current && hist.length > 0 && hist[0].content === greetingRef.current.content) {
          setMessages(hist);
        } else if (greetingRef.current) {
          setMessages([greetingRef.current, ...hist]);
        } else {
          setMessages(hist);
        }
      } else {
        // No hay historial: si hay greeting, mostrarlo
        if (greetingRef.current) {
          setMessages([greetingRef.current]);
        }
      }
      
  // 4. Ya hemos conectado al inicio de la inicialización (no reconectar)
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
    // Expose user-friendly error string in `error` and raw socket error in `socketError`
    error: initError || (typeof wsError === 'string' ? wsError : wsError?.message || null),
    socketError: wsError,
    tokenRefreshed,
    initialize,
    sendMessage,
    disconnect,
  };
}
