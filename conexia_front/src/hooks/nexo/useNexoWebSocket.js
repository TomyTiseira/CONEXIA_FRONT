import { useState, useEffect, useCallback, useRef } from 'react';
import { getNexoSocket, disconnectNexoSocket, reconnectNexoSocket } from '@/lib/socket/nexoSocket';

/**
 * Hook para manejar la conexión WebSocket con NEXO
 */
export function useNexoWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [tokenRefreshed, setTokenRefreshed] = useState(null);
  const socketRef = useRef(null);
  const listenersRef = useRef({});

  // Conectar al socket
  const connect = useCallback(() => {
    try {
      const socket = getNexoSocket();
      socketRef.current = socket;

      // Event: connect
      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      // Event: disconnect
      socket.on('disconnect', (reason) => {
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          // Server desconectó (probablemente auth error)
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      });

      // Event: connect_error
      socket.on('connect_error', (err) => {
        console.error('Error de conexión NEXO:', err);
        setError('No se pudo conectar con NEXO');
        setIsConnected(false);
      });

      // Event: error
      socket.on('error', (errorData) => {
        console.error('Error en NEXO:', errorData);
        // Keep error as an object when possible so callers can react to codes
        setError(
          typeof errorData === 'string'
            ? { message: errorData }
            : errorData || { message: 'Error desconocido' },
        );
      });

      // Custom event: connected (server may send auth info)
      socket.on('connected', (data) => {
        if (data && data.tokenRefreshed) {
          setTokenRefreshed(data);
        }
        // clear previous auth errors
        setError(null);
      });

      // Custom event: token_refreshed -> actualizar cookie en cliente
      socket.on('token_refreshed', (data) => {
        try {
          if (data && data.accessToken) {
            const expiresIn = data.expiresIn || 3600;
            const expires = new Date();
            expires.setSeconds(expires.getSeconds() + expiresIn);

            // Actualizar cookie de access_token
            document.cookie = `access_token=${data.accessToken}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;

            setTokenRefreshed(data);
            // clear any auth error
            setError(null);
          }
        } catch (err) {
          console.error('Error handling token_refreshed:', err);
        }
      });

      // Custom event: auth_error -> surface structured error so UI can react
      socket.on('auth_error', (err) => {
        console.error('NEXO auth_error:', err);
        if (typeof err === 'string') {
          setError({ code: 'auth_error', message: err });
        } else {
          setError({ code: err?.code || 'auth_error', message: err?.message || 'Error de autenticación' });
        }
      });

    } catch (err) {
      console.error('Error al conectar NEXO:', err);
      setError(err.message);
    }
  }, []);

  // Desconectar del socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
      socketRef.current.off('connect_error');
      socketRef.current.off('error');
      socketRef.current.off('connected');
      socketRef.current.off('token_refreshed');
      socketRef.current.off('auth_error');
      
      // Limpiar todos los listeners registrados
      Object.keys(listenersRef.current).forEach(event => {
        socketRef.current.off(event, listenersRef.current[event]);
      });
      listenersRef.current = {};
      
      disconnectNexoSocket();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Enviar mensaje
  const emit = useCallback((event, data) => {
    if (!socketRef.current) {
      setError('Socket no está conectado');
      return false;
    }
    
    if (!socketRef.current.connected) {
      setError('Socket desconectado');
      return false;
    }
    
    socketRef.current.emit(event, data);
    return true;
  }, []);

  // Escuchar evento
  const on = useCallback((event, handler) => {
    if (!socketRef.current) return;
    
    // Guardar referencia del handler para poder limpiarlo después
    listenersRef.current[event] = handler;
    socketRef.current.on(event, handler);
  }, []);

  // Dejar de escuchar evento
  const off = useCallback((event, handler) => {
    if (!socketRef.current) return;
    
    socketRef.current.off(event, handler);
    delete listenersRef.current[event];
  }, []);

  // Reconectar
  const reconnect = useCallback(() => {
    if (!isConnected) {
      reconnectNexoSocket();
    }
  }, [isConnected]);

  // Limpiar en unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    tokenRefreshed,
    connect,
    disconnect,
    emit,
    on,
    off,
    reconnect,
  };
}
