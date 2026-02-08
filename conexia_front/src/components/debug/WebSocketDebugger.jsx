'use client';
import { useEffect, useState } from 'react';
import { authSocketService } from '@/service/auth/authSocket.service';

/**
 * Componente de debugging para WebSocket
 * Solo para desarrollo - NO usar en producción
 * 
 * Para activar: Agregar <WebSocketDebugger /> en el layout o página principal
 */
export default function WebSocketDebugger() {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verificar conexión cada 2 segundos
    const interval = setInterval(() => {
      setIsConnected(authSocketService.isConnected());
    }, 2000);

    // Interceptar console.log para capturar logs del WebSocket
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, ...args) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      // Solo capturar logs relacionados con AuthSocket
      if (message.includes('[AuthSocket]') || message.includes('WebSocket')) {
        setLogs(prev => [...prev.slice(-19), { // Mantener últimos 20 logs
          type,
          message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };

    console.log = (...args) => {
      addLog('log', ...args);
      originalLog(...args);
    };

    console.error = (...args) => {
      addLog('error', ...args);
      originalError(...args);
    };

    console.warn = (...args) => {
      addLog('warn', ...args);
      originalWarn(...args);
    };

    return () => {
      clearInterval(interval);
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const testConnection = () => {
    const token = localStorage.getItem('access_token') || 
                  document.cookie.split('; ').find(r => r.startsWith('access_token='))?.split('=')[1];
    
    if (token) {
      console.log('🧪 [Debug] Intentando reconectar WebSocket...');
      authSocketService.disconnect();
      setTimeout(() => {
        authSocketService.connect(token);
      }, 500);
    } else {
      console.error('❌ [Debug] No se encontró token');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[99999]"
      >
        🔍 Debug WS
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl z-[99999] max-w-md max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-bold text-sm">
            WebSocket Auth Events
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      <div className="mb-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Estado:</span>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? '✅ Conectado' : '❌ Desconectado'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={testConnection}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
        >
          🔄 Reconectar
        </button>
        <button
          onClick={() => setLogs([])}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded"
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto bg-black rounded p-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No hay logs aún...
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warn' ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              {log.message}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
        💡 Abre la consola para ver logs completos
      </div>
    </div>
  );
}
