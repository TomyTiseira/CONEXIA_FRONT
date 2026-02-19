import { useChatList } from '@/hooks/messaging/useChatList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ChatList() {
  const { chats, loading } = useChatList();
  return (
    <aside className="chat-list">
      {loading ? <LoadingSpinner message="Cargando chats..." fullScreen={false} /> : (
        <ul>
          {chats.map(chat => (
            <li key={chat.id}>{chat.name}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
