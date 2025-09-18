import { useMessagingStore } from '@/store/messagingStore';

export function useChatMessages() {
  // Hook para obtener los mensajes del chat seleccionado
  const messages = useMessagingStore((s) => s.messages);
  const messagesPagination = useMessagingStore((s) => s.messagesPagination);
  const loading = useMessagingStore((s) => s.loadingMessages);
  const typingStates = useMessagingStore((s) => s.typingStates);

  const loadMessages = useMessagingStore((s) => s.loadMessages);
  const sendTextMessage = useMessagingStore((s) => s.sendTextMessage);
  const sendFileMessage = useMessagingStore((s) => s.sendFileMessage);
  const emitTyping = useMessagingStore((s) => s.emitTyping);
  const markCurrentAsRead = useMessagingStore((s) => s.markCurrentAsRead);

  return { messages, messagesPagination, loading, typingStates, loadMessages, sendTextMessage, sendFileMessage, emitTyping, markCurrentAsRead };
}
