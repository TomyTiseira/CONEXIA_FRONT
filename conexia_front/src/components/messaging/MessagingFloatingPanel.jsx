import { useRouter } from 'next/navigation';

export default function MessagingFloatingPanel() {
  const router = useRouter();
  // Panel flotante visual tipo LinkedIn, estilo Conexia
  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50 cursor-pointer" onClick={() => router.push('/messaging')}>
      <div className="bg-white shadow-xl rounded-lg w-[350px] h-[500px] flex flex-col border border-conexia-green hover:ring-2 hover:ring-conexia-green/40 transition-all">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-conexia-green text-white rounded-t-lg">
          <span className="font-semibold text-base">Mensajes</span>
          <button className="text-white hover:text-conexia-green/80" tabIndex={-1} disabled>×</button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[120px] border-r bg-[#f3f9f8] overflow-y-auto">
            {/* ChatList visual */}
            <ul className="divide-y">
              <li className="p-3 flex items-center gap-2 cursor-pointer hover:bg-conexia-green/10">
                <img src="/images/default-avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium text-sm text-conexia-green">Javier Carrizo</div>
                  <div className="text-xs text-gray-500 truncate">Hola Alex, el entorno laboral exige crecer...</div>
                </div>
              </li>
              {/* ...más chats... */}
            </ul>
          </div>
          <div className="flex-1 flex flex-col justify-between bg-white">
            {/* ChatView visual */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <img src="/images/default-avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-conexia-green">Javier Carrizo</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#f3f9f8] rounded-lg p-3 text-sm text-gray-700 mb-2">
                  Hola Alex,<br />Hoy, el entorno laboral exige crecer para sostenerse, y los vínculos correctos pueden marcar la diferencia.
                </div>
                <div className="text-xs text-gray-400">30 AGO - 11:10</div>
              </div>
              {/* ...más mensajes... */}
            </div>
            <form className="p-3 border-t flex gap-2" onClick={e => e.stopPropagation()}>
              <input type="text" className="flex-1 border rounded px-3 py-2 text-sm focus:outline-conexia-green" placeholder="Escribe un mensaje..." disabled />
              <button type="submit" className="bg-conexia-green text-white px-4 py-2 rounded font-medium text-sm hover:bg-conexia-green/80" disabled>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
