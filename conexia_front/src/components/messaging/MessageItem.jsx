import AttachmentPreview from './AttachmentPreview';

export default function MessageItem({ message }) {
  return (
    <div className="message-item">
      <div>{message.text}</div>
      {message.attachment && <AttachmentPreview attachment={message.attachment} />}
    </div>
  );
}
