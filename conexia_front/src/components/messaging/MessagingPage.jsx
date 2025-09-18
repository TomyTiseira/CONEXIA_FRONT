import ChatList from './ChatList';
import ChatView from './ChatView';

export default function MessagingPage() {
  // Página completa para mobile
  return (
    <div>
      <ChatList />
      <ChatView />
    </div>
  );
}

