import { useMessagingStore } from '@/store/messagingStore';

export function useMessaging() {
  // Hook principal para lógica global de mensajería
  const chats = useMessagingStore((s) => s.chats);
  const chatsPagination = useMessagingStore((s) => s.chatsPagination);
  const selectedChatId = useMessagingStore((s) => s.selectedChatId);
  const selectedOtherUserId = useMessagingStore((s) => s.selectedOtherUserId);
  const loading = useMessagingStore((s) => s.loading);
  const unreadCount = useMessagingStore((s) => s.unreadCount);

  const loadConversations = useMessagingStore((s) => s.loadConversations);
  const selectConversation = useMessagingStore((s) => s.selectConversation);
  const leaveConversation = useMessagingStore((s) => s.leaveConversation);
  const refreshUnreadCount = useMessagingStore((s) => s.refreshUnreadCount);
  const setSelectedChatId = useMessagingStore((s) => s.setSelectedChatId);

  return {
    chats,
    chatsPagination,
    selectedChatId,
    selectedOtherUserId,
    loading,
    unreadCount,
    loadConversations,
    selectConversation,
    leaveConversation,
    refreshUnreadCount,
    setSelectedChatId,
  };
}
