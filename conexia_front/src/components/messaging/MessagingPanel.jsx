import ChatList from './ChatList';
import ChatView from './ChatView';
import './messaging.css';

export default function MessagingPanel() {
  // Aquí iría la lógica para mostrar/ocultar el panel flotante y manejar el responsive
  return (
    <div className="messaging-panel">
      <ChatList />
      <ChatView />
    </div>
  );
}
