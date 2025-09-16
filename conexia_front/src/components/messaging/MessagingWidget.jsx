import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ChatCard from './ChatCard';
import ContactCard from './ContactCard';
import ChatFloatingPanel from './ChatFloatingPanel';
import { PenSquare } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import { config } from '@/config';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { getMessagingSocket } from '@/lib/socket/messagingSocket';
import { useChatMessages } from '@/hooks/messaging/useChatMessages';

export default function MessagingWidget({ avatar = '/images/default-avatar.png', chats = [] }) {
  const [open, setOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [convSearch, setConvSearch] = useState(''); // <- NUEVO: texto del buscador
  // Helper para normalizar la URL de la imagen de perfil
  const getProfilePictureUrl = (img) => {
    const defaultAvatar = '/images/default-avatar.png';
    const joinUrl = (base, path) => `${String(base).replace(/\/+$/,'')}/${String(path).replace(/^\/+/, '')}`;
    if (!img) return defaultAvatar;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads')) return joinUrl(config.DOCUMENT_URL, img);
    if (img.startsWith('/')) return joinUrl(config.DOCUMENT_URL, img);
    // bare filename → served under /uploads base
    return joinUrl(config.IMAGE_URL, img);
  };

  const { user } = useUserStore();
  const userId = user?.id;
  const { friends, loading, error, pagination, loadMore } = useUserFriends(userId, 1, 12);

  // Store chats
  const { chats: convs, loading: chatsLoading, loadConversations, selectConversation, refreshUnreadCount } = useMessaging();
  const { messages } = useChatMessages(); // <- NUEVO

  useEffect(() => {
    // cargar conversaciones iniciales
    loadConversations({ page: 1, limit: 10 });
  }, [loadConversations]);

  // Escuchar eventos socket y refrescar historial + no leídos (con throttle)
  useEffect(() => {
    const socket = getMessagingSocket();
    let ticking = false;
    const doRefresh = () => {
      if (ticking) return;
      ticking = true;
      const term = (convSearch || '').trim();
      // Refresco ligero y seguro
      Promise.resolve().then(() => {
        loadConversations({ page: 1, limit: 10, append: false, search: term || undefined });
        refreshUnreadCount();
      }).finally(() => {
        // permitir otro refresh tras un breve respiro
        setTimeout(() => { ticking = false; }, 350);
      });
    };

    const onConnect = () => doRefresh();
    const onNewMsg = () => doRefresh();
    const onNotif = () => doRefresh();

    socket?.on?.('connect', onConnect);
    socket?.on?.('reconnect', onConnect);
    socket?.on?.('newMessage', onNewMsg);
    socket?.on?.('messageNotification', onNotif);

    return () => {
      socket?.off?.('connect', onConnect);
      socket?.off?.('reconnect', onConnect);
      socket?.off?.('newMessage', onNewMsg);
      socket?.off?.('messageNotification', onNotif);
    };
  }, [loadConversations, refreshUnreadCount, convSearch]);

  // Fallback: si cambian los mensajes del chat activo, refrescar historial + no leídos
  useEffect(() => {
    if (!open) return; // refrescar solo si el modal está visible
    const term = (convSearch || '').trim();
    loadConversations({ page: 1, limit: 10, append: false, search: term || undefined });
    refreshUnreadCount();
  }, [messages?.length, open, convSearch, loadConversations, refreshUnreadCount]);

  // Debounce de búsqueda: 350ms
  useEffect(() => {
    // Solo aplica en historial (no contactos)
    if (!open || showContacts) return;
    const handle = setTimeout(() => {
      const term = convSearch.trim();
      loadConversations({ page: 1, limit: 10, append: false, search: term || undefined });
    }, 350);
    return () => clearTimeout(handle);
  }, [convSearch, open, showContacts, loadConversations]);

  // Fallback 2: refrescar al volver a la pestaña
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const term = (convSearch || '').trim();
        loadConversations({ page: 1, limit: 10, append: false, search: term || undefined });
        refreshUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [convSearch, loadConversations, refreshUnreadCount]);

  // Fallback 3: polling suave cada 30s mientras el widget vive
  useEffect(() => {
    const id = setInterval(() => {
      const term = (convSearch || '').trim();
      loadConversations({ page: 1, limit: 10, append: false, search: term || undefined });
      refreshUnreadCount();
    }, 30000);
    return () => clearInterval(id);
  }, [convSearch, loadConversations, refreshUnreadCount]);

  // Helpers: display name (first and last token) and date label (Hoy/Ayer/fecha + hora)
  const getDisplayName = (userName, fallbackId) => {
    if (!userName || !userName.trim()) return `Usuario ${fallbackId ?? ''}`.trim();
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };
  const formatDateLabel = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return 'Hoy';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isYesterday) return 'Ayer';
    return d.toLocaleDateString();
  };
  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatListDateTimeParts = (iso) => {
    if (!iso) return { day: '', time: '' };
    const day = formatDateLabel(iso);
    const time = formatTime(iso);
    return { day, time };
  };

  return (
    <div className="hidden md:flex flex-row-reverse items-end fixed right-6 bottom-0 z-50 gap-6">
      {/* Contenedor vertical: flotante principal y modal de historial */}
      <div className="flex flex-col items-end">
        {/* Flotante principal */}
        <div
          className={`bg-white shadow-xl rounded-t-lg rounded-b-none w-[300px] h-[44px] flex items-center justify-between border border-conexia-green hover:ring-2 hover:ring-conexia-green/40 transition-all px-3 relative ${open ? 'mb-0' : ''}`}
          style={{ backgroundImage: 'url(/bg-smoke2.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: open ? 'none' : '1.5px solid #1e6e5c' }}
          onClick={e => {
            // Si el click viene del botón de redactar, no cerrar/abrir modal
            if (e.target.closest('button[title="Nuevo mensaje"]')) return;
            if (open) {
              setOpen(false);
              setShowContacts(false);
              // No cerrar el chat individual al cerrar el modal principal
            } else {
              setOpen(true);
              setShowContacts(false);
            }
          }}
        >
          <div className="flex items-center">
            {/* Foto de perfil y punto verde */}
            <div className="relative flex items-center">
              <Image src={avatar} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white shadow"></span>
            </div>
            {/* Título */}
            <span className="font-semibold text-white text-sm tracking-wide drop-shadow-sm ml-2">Mensajes</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Icono redactar (LucidePenSquare) */}
            <button
              className="flex items-center justify-center w-7 h-7 bg-transparent p-0"
              title="Nuevo mensaje"
              style={{ minWidth: 0 }}
              onClick={e => {
                e.stopPropagation();
                if (!open) {
                  setOpen(true);
                  setShowContacts(true);
                } else {
                  setShowContacts(true);
                }
              }}
            >
              <PenSquare size={18} color="#fff" strokeWidth={2.2} />
            </button>
            {/* Icono desplegable */}
            <div className={`flex items-center justify-center w-7 h-7 transition-transform cursor-pointer ${open ? '' : 'rotate-180'}`} onClick={e => { e.stopPropagation(); setOpen(!open); setShowContacts(false); }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                <path d="M8 10l4 4 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        {/* Modal principal debajo del flotante */}
        {open && (
          <div className="w-[300px] h-[420px] bg-white rounded-b-none rounded-t-none shadow-2xl border-x border-conexia-green flex flex-col animate-fadeIn mt-0" style={{ backgroundImage: 'url(/bg-smoke.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Header modal */}
            {showContacts ? (
              <div className="px-3 py-2 border-b bg-[#f3f9f8] flex items-center gap-2 w-full min-h-[44px]">
                {/* Icono volver atrás al lado izquierdo del título, color verde petróleo */}
                <button
                  className="flex items-center justify-center w-7 h-7 bg-transparent p-0 mr-1"
                  title="Volver al historial"
                  style={{ minWidth: 0 }}
                  onClick={() => setShowContacts(false)}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke="#1e6e5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="font-semibold text-conexia-green text-base">Nuevo mensaje</span>
              </div>
            ) : (
              <div className="px-3 py-2 border-b bg-[#f3f9f8] flex items-center gap-2 w-full min-h-[44px]">
                <input
                  type="text"
                  className="w-full border rounded px-2 py-2 text-sm focus:outline-conexia-green"
                  placeholder="Buscar por contacto..."
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setConvSearch('');
                  }}
                />
              </div>
            )}
            {/* Sección de contactos o historial */}
            <div className="flex-1 overflow-y-auto bg-white scrollbar-soft-lg">
              {showContacts ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 font-semibold">Conexiones</div>
                  <div
                    className="flex flex-col gap-0 w-full scrollbar-soft-lg"
                    onScroll={e => {
                      const el = e.target;
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && pagination?.hasNextPage && !loading) {
                        loadMore();
                      }
                    }}
                    style={{ maxHeight: '340px', overflowY: 'auto' }}
                  >
                    {friends.length === 0 && !loading ? (
                      <div className="p-2 text-conexia-green/70 text-center">No tiene contactos aún.</div>
                    ) : (
                      friends.map(friend => (
                        <ContactCard
                          key={friend.id}
                          avatar={getProfilePictureUrl(friend.profilePicture)}
                          name={friend.userName}
                          description={friend.profession}
                          online={false}
                          onClick={() => {
                            const convId = friend.conversationId || null;
                            setActiveChat({
                              id: friend.id,
                              avatar: getProfilePictureUrl(friend.profilePicture),
                              name: friend.userName,
                              profession: friend.profession,
                              conversationId: convId,
                            });
                            selectConversation({
                              conversationId: convId,
                              otherUserId: friend.id,
                              otherUser: { id: friend.id, userName: friend.userName, userProfilePicture: friend.profilePicture }
                            });
                            setShowContacts(false);
                          }}
                        />
                      ))
                    )}
                    {loading && (
                      <div className="p-2 text-conexia-green/70 text-center">Cargando...</div>
                    )}
                    {!pagination?.hasNextPage && friends.length > 0 && (
                      <div className="p-2 text-conexia-green/60 text-center"></div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-0 w-full">
                  {convs.length === 0 && !chatsLoading ? (
                    <div className="p-2 text-conexia-green/70 text-center">
                      {convSearch.trim() ? 'Sin resultados' : 'No hay mensajes'}
                    </div>
                  ) : (
                    convs.map(chat => {
                      const other = chat.otherUser || {};
                      const displayName = getDisplayName(other.userName, other.id);
                      const avatarUrl = getProfilePictureUrl(other.userProfilePicture);
                      const lastMsg = chat.lastMessage || {};
                      const rawLastContent = lastMsg.type === 'text' ? (lastMsg.content || '') : (lastMsg.type === 'image' ? 'Imagen' : 'Documento');
                      const isMine = String(lastMsg.senderId) === String(user?.id);
                      const lastContent = isMine ? `Yo: ${rawLastContent}` : rawLastContent;
                      const { day: dateLabel, time } = formatListDateTimeParts(lastMsg.createdAt);
                      return (
                        <ChatCard
                          key={chat.id}
                          avatar={avatarUrl}
                          name={displayName}
                          lastMessage={lastContent}
                          dateLabel={dateLabel}
                          time={time}
                          online={false}
                          unreadCount={chat.unreadCount || 0}  
                          onClick={() => {
                            setActiveChat({ id: other.id, avatar: avatarUrl, name: displayName, conversationId: chat.id });
                            // pasar también metadatos del otro usuario
                            selectConversation({
                              conversationId: chat.id,
                              otherUserId: other.id,
                              otherUser: { id: other.id, userName: other.userName, userProfilePicture: other.userProfilePicture }
                            });
                          }}
                        />
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Contenedor horizontal: chats flotantes al costado izquierdo */}
      <div className="flex flex-row-reverse items-end gap-8">
        {activeChat && (
          <ChatFloatingPanel
            user={activeChat}
            onClose={() => setActiveChat(null)}
            disableOutsideClose={true}
          />
        )}
      </div>
      <style jsx>{`
        /* Scrollbar del modal principal (más ancha, color celeste claro) */
        .scrollbar-soft-lg::-webkit-scrollbar { width: 10px; height: 10px; }
        .scrollbar-soft-lg::-webkit-scrollbar-thumb { background: #d3d8d8ff; border-radius: 10px; }
        .scrollbar-soft-lg::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-soft-lg { scrollbar-color: #d3d8d8ff transparent; scrollbar-width: auto; }
      `}</style>
    </div>
  );
}

