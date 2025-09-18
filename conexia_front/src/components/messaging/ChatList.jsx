import { useChatList } from '@/hooks/messaging/useChatList';

export default function ChatList() {
  const { chats, loading } = useChatList();
  return (
    <aside className="chat-list">
      {loading ? <div>Cargando chats...</div> : (
        <ul>
          {chats.map(chat => (
            <li key={chat.id}>{chat.name}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
