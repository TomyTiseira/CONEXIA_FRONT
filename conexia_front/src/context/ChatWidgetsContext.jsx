'use client';

import { createContext, useContext, useState } from 'react';

const ChatWidgetsContext = createContext();

export function ChatWidgetsProvider({ children }) {
  const [nexoOpen, setNexoOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  const openNexo = () => {
    setNexoOpen(true);
    setMessagingOpen(false); // Cerrar mensajería al abrir NEXO
  };

  const closeNexo = () => {
    setNexoOpen(false);
  };

  const openMessaging = () => {
    setMessagingOpen(true);
    setNexoOpen(false); // Cerrar NEXO al abrir mensajería
  };

  const closeMessaging = () => {
    setMessagingOpen(false);
  };

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
