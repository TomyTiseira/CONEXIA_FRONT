import { useMessagingStore } from '@/store/messagingStore';

export function useChatList() {
  // Hook para obtener la lista de chats con paginación
  const chats = useMessagingStore((s) => s.chats);
  const pagination = useMessagingStore((s) => s.chatsPagination);
  const loading = useMessagingStore((s) => s.loading);
  const loadConversations = useMessagingStore((s) => s.loadConversations);

  return { chats, pagination, loading, loadConversations };
}
