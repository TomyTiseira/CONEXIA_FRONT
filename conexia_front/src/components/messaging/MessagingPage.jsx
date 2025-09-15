import ChatList from './ChatList';
import ChatView from './ChatView';
import './messaging.css';

export default function MessagingPage() {
  // Página completa para mobile
  return (
    <div className="messaging-page">
      <ChatList />
      <ChatView />
    </div>
  );
}
