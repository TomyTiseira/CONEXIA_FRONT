export default function MessageInput() {
  // Aquí iría la lógica para enviar mensajes y adjuntar archivos
  return (
    <form className="message-input">
      <input type="text" placeholder="Escribe un mensaje..." />
      <button type="submit">Enviar</button>
    </form>
  );
}
