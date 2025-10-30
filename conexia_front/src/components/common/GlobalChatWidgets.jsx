'use client';

import { useState } from 'react';
import NexoChat from '@/components/nexo/NexoChat';
import MessagingWidget from '@/components/messaging/MessagingWidget';

/**
 * Wrapper que gestiona el comportamiento dinámico entre NEXO y MessagingWidget
 * Solo uno puede estar abierto a la vez
 */
export default function GlobalChatWidgets({ avatar }) {
  const [isNexoOpen, setIsNexoOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const handleNexoStateChange = (nexoOpen) => {
    setIsNexoOpen(nexoOpen);
    // Si NEXO se abre, minimizar el chat de mensajería
    // (MessagingWidget maneja su propio estado internamente, 
    // por lo que solo usamos esto para controlar z-index y visibilidad)
  };

  return (
    <>
      {/* NEXO Chatbot */}
      <NexoChat
        isMessagingChatOpen={isMessagingOpen}
        onNexoStateChange={handleNexoStateChange}
      />

      {/* Messaging Widget - se oculta parcialmente cuando NEXO está abierto */}
      <div className={`${isNexoOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
        <MessagingWidget avatar={avatar} />
      </div>
    </>
  );
}
