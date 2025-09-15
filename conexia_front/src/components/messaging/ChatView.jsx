import { useChatMessages } from '@/hooks/messaging/useChatMessages';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

export default function ChatView() {
  const { messages, loading } = useChatMessages();
  return (
    <section className="chat-view">
      <div className="messages">
        {loading ? <div>Cargando mensajes...</div> : (
          messages.map(msg => <MessageItem key={msg.id} message={msg} />)
        )}
      </div>
      <MessageInput />
    </section>
  );
}
