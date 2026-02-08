'use client';

import { createContext, useContext } from 'react';
import { useChatWidgetsStore } from '@/store/chatWidgetsStore';

const ChatWidgetsContext = createContext();

/**
 * Proveedor de compatibilidad: anteriormente la aplicación usaba un React Context.
 * Ahora la fuente de la verdad es el store de Zustand; este proveedor
 * simplemente reexpone el estado y las acciones del store para que los
 * consumidores existentes sigan funcionando sin cambios.
 */
export function ChatWidgetsProvider({ children }) {
  const nexoOpen = useChatWidgetsStore((s) => s.nexoOpen);
  const messagingOpen = useChatWidgetsStore((s) => s.messagingOpen);
  const openNexo = useChatWidgetsStore((s) => s.openNexo);
  const closeNexo = useChatWidgetsStore((s) => s.closeNexo);
  const openMessaging = useChatWidgetsStore((s) => s.openMessaging);
  const closeMessaging = useChatWidgetsStore((s) => s.closeMessaging);

  return (
    <ChatWidgetsContext.Provider
      value={{
        nexoOpen,
        messagingOpen,
        openNexo,
        closeNexo,
        openMessaging,
        closeMessaging,
      }}
    >
      {children}
    </ChatWidgetsContext.Provider>
  );
}

export function useChatWidgets() {
  const context = useContext(ChatWidgetsContext);
  if (!context) {
    throw new Error('useChatWidgets debe usarse dentro de ChatWidgetsProvider');
  }
  return context;
}
