'use client';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { useUserStore } from '@/store/userStore';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import ChatCard from '@/components/messaging/ChatCard';
import ContactCard from '@/components/messaging/ContactCard';
import { useRouter } from 'next/navigation';
import { PenSquare, ArrowLeft } from 'lucide-react';
import { config } from '@/config';
import ChatView from '@/components/messaging/ChatView';
import { useChatMessages } from '@/hooks/messaging/useChatMessages'; // <- NUEVO
import { getMessagingSocket } from '@/lib/socket/messagingSocket';

export default function MessagingHomePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const userId = user?.id;
  const { chats: convs, loadConversations, selectConversation, refreshUnreadCount } = useMessaging();
  const { friends, loading, pagination, loadMore } = useUserFriends(userId, 1, 30);
  const { typingStates, messages } = useChatMessages(); // <- NUEVO

  const [search, setSearch] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [panelUser, setPanelUser] = useState(null);

  const getProfilePictureUrl = (img) => {
    const def = '/images/default-avatar.png';
    const j = (b, p) => `${String(b).replace(/\/+$/,'')}/${String(p).replace(/^\/+/, '')}`;
    if (!img) return def;
    if (/^https?:\/\//i.test(img)) return img;
    if (img.startsWith('/images/')) return img; // ← mantener assets públicos
    if (img.startsWith('/uploads')) return j(config.DOCUMENT_URL, img);
    if (img.startsWith('/')) return j(config.DOCUMENT_URL, img);
    return j(config.IMAGE_URL, img);
  };
  const getDisplayName = (userName, id) => {
    if (!userName || !userName.trim()) return `Usuario ${id ?? ''}`.trim();
    const p = userName.trim().split(/\s+/);
    return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1]}`;
  };
  const formatDateLabel = (iso) => {
    if (!iso) return '';
    const d = new Date(iso); const t = new Date();
    if (d.toDateString() === t.toDateString()) return 'Hoy';
    const y = new Date(); y.setDate(t.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Ayer';
    return d.toLocaleDateString();
  };
  const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
  const parts = (iso) => ({ day: formatDateLabel(iso), time: formatTime(iso) });

  useEffect(() => { loadConversations({ page: 1, limit: 50 }); }, [loadConversations]);

  // Paridad con el modal flotante: refrescar historial por eventos de socket (throttle)
  useEffect(() => {
    const socket = getMessagingSocket();
    let ticking = false;
    const doRefresh = () => {
      if (ticking) return;
      ticking = true;
      const term = (search || '').trim();
      Promise.resolve()
        .then(() => {
          loadConversations({ page: 1, limit: 50, append: false, search: term || undefined });
          refreshUnreadCount();
        })
        .finally(() => {
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
  }, [loadConversations, refreshUnreadCount, search]);

  // Fallback: si cambian los mensajes del chat activo, refrescar historial + no leídos
  useEffect(() => {
    const term = (search || '').trim();
    loadConversations({ page: 1, limit: 50, append: false, search: term || undefined });
    refreshUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  // Debounce de búsqueda
  useEffect(() => {
    const handle = setTimeout(() => {
      const term = (search || '').trim();
      loadConversations({ page: 1, limit: 50, append: false, search: term || undefined });
    }, 350);
    return () => clearTimeout(handle);
  }, [search, loadConversations]);

  // Refrescar al volver a la pestaña
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const term = (search || '').trim();
        loadConversations({ page: 1, limit: 50, append: false, search: term || undefined });
        refreshUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [search, loadConversations, refreshUnreadCount]);

  // Polling suave cada 30s
  useEffect(() => {
    const id = setInterval(() => {
      const term = (search || '').trim();
      loadConversations({ page: 1, limit: 50, append: false, search: term || undefined });
      refreshUnreadCount();
    }, 30000);
    return () => clearInterval(id);
  }, [search, loadConversations, refreshUnreadCount]);

  const filteredConvs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return convs;
    return convs.filter(c => {
      const name = (c.otherUser?.userName || '').toLowerCase();
      const last = (c.lastMessage?.content || '').toLowerCase();
      return name.includes(term) || last.includes(term);
    });
  }, [convs, search]);

  return (
    <>
      <Navbar />
  {/* Altura mobile descuenta bottom nav (56px). Margen arriba/abajo consistente. */}
  <main className="h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[#f3f9f8] px-2 md:px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:pt-4 md:pb-4">
        <div
          className="mx-auto h-full max-w-7xl bg-white rounded-xl md:rounded-2xl shadow border border-[#c6e3e4] overflow-hidden grid grid-cols-1 md:grid-cols-[360px_1fr]"
        >
          {/* Columna izquierda */}
          <aside className="flex flex-col h-full min-h-0 border-r border-[#c6e3e4]">
            {/* Header izquierda */}
            <div className="h-14 flex items-center px-3 md:px-4 gap-3 bg-[#f3f9f8] border-b border-[#c6e3e4] shrink-0">
              {showContacts && (
                <button
                  className="text-conexia-green hover:bg-[#e0f0f0] p-2 rounded transition-colors"
                  title="Volver al historial"
                  onClick={() => setShowContacts(false)}
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2 className="text-conexia-green font-bold text-lg flex-1 truncate">
                {showContacts ? 'Conexiones' : 'Mensajes'}
              </h2>
              {/* Botón redactar: ocultar cuando estamos en conexiones */}
              {!showContacts && (
                <button
                  className="inline-flex items-center justify-center bg-conexia-green text-white rounded-lg w-10 h-10 md:w-9 md:h-9 hover:bg-conexia-green/90 transition"
                  title="Redactar nuevo mensaje"
                  onClick={() => setShowContacts(true)}
                >
                  <PenSquare size={18} />
                </button>
              )}
            </div>

            {/* Buscador (solo historial) */}
            {!showContacts && (
              <div className="px-3 md:px-4 py-3 border-b border-[#e2efef] bg-white">
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-conexia-green"
                  placeholder="Buscar mensajes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {/* Lista scrollable con min-h-0 para permitir scroll en mobile */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-conv pb-2 md:pb-0">
              {!showContacts ? (
                <div className="flex flex-col">
                  {filteredConvs.length === 0 ? (
                    <div className="p-4 text-conexia-green/60 text-center text-sm">No hay mensajes</div>
                  ) : filteredConvs.map(chat => {
                    const other = chat.otherUser || {};
                    const displayName = getDisplayName(other.userName, other.id);
                    const avatarUrl = getProfilePictureUrl(other.userProfilePicture);
                    const lastMsg = chat.lastMessage || {};
                    const raw = lastMsg.type === 'text' ? (lastMsg.content || '') : (lastMsg.type === 'image' ? 'Imagen' : 'Documento');
                    const isMine = String(lastMsg.senderId) === String(user?.id);
                    // NUEVO: estado "escribiendo…" en historial
                    const isTyping = !!typingStates?.[other.id];
                      const last = isTyping ? 'Escribiendo' : (isMine ? `Yo: ${raw}` : raw);
                    const { day, time } = parts(lastMsg.createdAt);
                    return (
                      <ChatCard
                        key={chat.id}
                        avatar={avatarUrl}
                        name={displayName}
                        lastMessage={last}
                        isTyping={isTyping}
                        dateLabel={day}
                        time={time}
                        unreadCount={chat.unreadCount || 0}
                        online={false}
                        onClick={() => {
                          const panel = { id: other.id, avatar: avatarUrl, name: displayName, conversationId: chat.id };
                          selectConversation({
                            conversationId: chat.id,
                            otherUserId: other.id,
                            otherUser: { id: other.id, userName: other.userName, userProfilePicture: other.userProfilePicture }
                          });
                          if (window.innerWidth < 768) {
                            router.push(`/messaging/${chat.id}`);
                          } else {
                            setPanelUser(panel);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col pb-6"  /* padding extra para ver último contacto */
                  onScroll={e => {
                    const el = e.currentTarget;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && pagination?.hasNextPage && !loading) loadMore();
                  }}
                >
                  {friends.length === 0 && !loading && (
                    <div className="p-4 text-conexia-green/60 text-center text-sm">No tiene contactos aún.</div>
                  )}
                  {friends.map(friend => (
                    <ContactCard
                      key={friend.id}
                      avatar={getProfilePictureUrl(friend.profilePicture)}
                      name={friend.userName}
                      description={friend.profession}
                      online={false}
                      onClick={() => {
                        const convId = friend.conversationId || null;
                        const panel = { id: friend.id, avatar: getProfilePictureUrl(friend.profilePicture), name: friend.userName, conversationId: convId };
                        selectConversation({
                          conversationId: convId,
                          otherUserId: friend.id,
                          otherUser: { id: friend.id, userName: friend.userName, userProfilePicture: friend.profilePicture }
                        });
                        if (window.innerWidth < 768) {
                          if (convId) router.push(`/messaging/${convId}`); else router.push(`/messaging/u/${friend.id}`);
                        } else {
                          setPanelUser(panel);
                        }
                      }}
                    />
                  ))}
                  {loading && <div className="p-3 text-conexia-green/60 text-center text-sm">Cargando...</div>}
                </div>
              )}
            </div>
          </aside>

          {/* Panel derecho (chat) - asegurar min-h-0 para que ChatView maneje su scroll */}
          <section className="hidden md:flex h-full min-h-0">
            {panelUser
              ? <ChatView user={panelUser} />
              : <div className="m-auto text-conexia-green/50 text-sm">Selecciona una conversación</div>}
          </section>
        </div>
      </main>

      <style jsx global>{`
        .scrollbar-conv::-webkit-scrollbar { width: 10px; }
        .scrollbar-conv::-webkit-scrollbar-track { background: #f3f9f8; }
        .scrollbar-conv::-webkit-scrollbar-thumb { background:#d3dede; border-radius:6px; }
        .scrollbar-conv { scrollbar-width: thin; scrollbar-color:#d3dede #f3f9f8; }
      `}</style>
    </>
  );
}

