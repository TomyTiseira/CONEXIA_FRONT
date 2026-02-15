import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ChatCard from "./ChatCard";
import ContactCard from "./ContactCard";
import ChatFloatingPanel from "./ChatFloatingPanel";
import { PenSquare } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { ROLES } from "@/constants/roles";
import { useUserFriends } from "@/hooks/connections/useUserFriends";
import { config } from "@/config";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { getMessagingSocket } from "@/lib/socket/messagingSocket";
import { useChatMessages } from "@/hooks/messaging/useChatMessages";
import { useChatWidgets } from "@/context/ChatWidgetsContext";

export default function MessagingWidget({
  avatar = "/images/default-avatar.png",
  chats = [],
}) {
  const [open, setOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [convSearch, setConvSearch] = useState(""); // <- NUEVO: texto del buscador
  // NUEVO: persistencia UI simple en localStorage
  const PERSIST_KEY = "conexia:messaging:ui:v1";
  const restoredRef = useRef(false);

  const { user, roleName } = useUserStore();
  const userId = user?.id;
  const { friends, loading, error, pagination, loadMore } = useUserFriends(
    userId,
    1,
    12,
  );

  // Store chats
  const {
    chats: convs,
    loading: chatsLoading,
    loadConversations,
    selectConversation,
    refreshUnreadCount,
  } = useMessaging();
  const { messages, typingStates } = useChatMessages(); // <- incluir typingStates

  // Context para coordinar con NEXO
  const { nexoOpen, openMessaging, closeMessaging } = useChatWidgets();

  // Cerrar el chat cuando NEXO se abre
  useEffect(() => {
    if (nexoOpen) {
      setOpen(false);
      setActiveChat(null);
    }
  }, [nexoOpen]);

  // Restaurar estado al montar (si existe)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(PERSIST_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === "object") {
        if (data.open === true) {
          setOpen(true);
          setShowContacts(false);
        }
        const ac = data.activeChat;
        if (ac && ac.id) {
          const name = ac.name || ac.userName || "";
          const pp =
            ac.userProfilePicture || ac.profilePicture || ac.avatar || null;
          const convId = ac.conversationId || null;
          const normalized = {
            id: ac.id,
            name,
            avatar: getProfilePictureUrl(pp),
            conversationId: convId,
          };
          setActiveChat(normalized);
          // seleccionar conversación de forma silenciosa
          selectConversation({
            conversationId: convId,
            otherUserId: ac.id,
            otherUser: {
              id: ac.id,
              userName: name,
              userProfilePicture: pp || null,
            },
          });
          // refrescar liviano
          loadConversations({ page: 1, limit: 10, append: false });
          refreshUnreadCount();
        }
      }
    } catch {
      // ignore
    }
  }, [selectConversation, loadConversations, refreshUnreadCount]);

  // Guardar estado cuando cambie open/activeChat
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const payload = {
        open: !!open,
        activeChat: activeChat
          ? {
              id: activeChat.id,
              name: activeChat.name,
              // guardar both por compatibilidad
              avatar: activeChat.avatar || null,
              profilePicture: activeChat.avatar || null,
              userProfilePicture: activeChat.avatar || null,
              conversationId: activeChat.conversationId || null,
            }
          : null,
      };
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [
    open,
    activeChat?.id,
    activeChat?.name,
    activeChat?.avatar,
    activeChat?.conversationId,
  ]);

  // Notificar al contexto cuando el chat se abre/cierra o activeChat cambia
  useEffect(() => {
    if (open || activeChat) {
      openMessaging();
    } else {
      closeMessaging();
    }
  }, [open, activeChat, openMessaging, closeMessaging]);

  // Helper para normalizar la URL de la imagen de perfil
  const getProfilePictureUrl = (img) => {
    const defaultAvatar = "/images/default-avatar.png";
    if (!img) return defaultAvatar;
    if (img === defaultAvatar) return defaultAvatar;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return buildMediaUrl(img);
  };

  // Cargar conversaciones iniciales
  useEffect(() => {
    loadConversations({ page: 1, limit: 10 });
  }, [loadConversations]);

  // NUEVO: abrir chat desde fuera (perfil) sin romper comportamiento actual
  useEffect(() => {
    const handler = (e) => {
      try {
        const detail = e?.detail || {};
        const target = detail.user || {};
        if (!target?.id) return;

        // Abrir el modal principal SOLO si así se solicita
        if (detail.openMain === true) {
          setOpen(true);
          setShowContacts(false);
        }

        const displayName = target.userName || target.name || "";
        const avatarUrl =
          target.userProfilePicture ||
          target.profilePicture ||
          target.avatar ||
          "/images/default-avatar.png";
        const conversationId = target.conversationId || null;

        // Setear panel flotante al costado del modal principal
        setActiveChat({
          id: target.id,
          avatar: getProfilePictureUrl(avatarUrl),
          name: displayName,
          conversationId,
        });

        // Seleccionar conversación en el store (resuelve id si no viene)
        selectConversation({
          conversationId,
          otherUserId: target.id,
          otherUser: {
            id: target.id,
            userName: displayName,
            userProfilePicture:
              target.userProfilePicture || target.profilePicture || null,
          },
        });

        // Refrescar historial y no leídos de forma suave
        loadConversations({
          page: 1,
          limit: 10,
          append: false,
          search: (convSearch || "").trim() || undefined,
        });
        refreshUnreadCount();
      } catch {}
    };
    window.addEventListener("open-chat-with", handler);
    return () => window.removeEventListener("open-chat-with", handler);
  }, [selectConversation, loadConversations, refreshUnreadCount, convSearch]);

  // Escuchar eventos socket y refrescar historial + no leídos (con throttle)
  useEffect(() => {
    const socket = getMessagingSocket();
    let ticking = false;
    const doRefresh = () => {
      if (ticking) return;
      ticking = true;
      const term = (convSearch || "").trim();
      // Refresco ligero y seguro
      Promise.resolve()
        .then(() => {
          loadConversations({
            page: 1,
            limit: 10,
            append: false,
            search: term || undefined,
          });
          refreshUnreadCount();
        })
        .finally(() => {
          // permitir otro refresh tras un breve respiro
          setTimeout(() => {
            ticking = false;
          }, 350);
        });
    };

    const onConnect = () => doRefresh();
    const onNewMsg = () => doRefresh();
    const onNotif = () => doRefresh();

    socket?.on?.("connect", onConnect);
    socket?.on?.("reconnect", onConnect);
    socket?.on?.("newMessage", onNewMsg);
    socket?.on?.("messageNotification", onNotif);

    return () => {
      socket?.off?.("connect", onConnect);
      socket?.off?.("reconnect", onConnect);
      socket?.off?.("newMessage", onNewMsg);
      socket?.off?.("messageNotification", onNotif);
    };
  }, [loadConversations, refreshUnreadCount, convSearch]);

  // Fallback: si cambian los mensajes del chat activo, refrescar historial + no leídos
  useEffect(() => {
    if (!open) return; // refrescar solo si el modal está visible
    const term = (convSearch || "").trim();
    loadConversations({
      page: 1,
      limit: 10,
      append: false,
      search: term || undefined,
    });
    refreshUnreadCount();
  }, [
    messages?.length,
    open,
    convSearch,
    loadConversations,
    refreshUnreadCount,
  ]);

  // Debounce de búsqueda: 350ms
  useEffect(() => {
    // Solo aplica en historial (no contactos)
    if (!open || showContacts) return;
    const handle = setTimeout(() => {
      const term = convSearch.trim();
      loadConversations({
        page: 1,
        limit: 10,
        append: false,
        search: term || undefined,
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [convSearch, open, showContacts, loadConversations]);

  // Fallback 2: refrescar al volver a la pestaña
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const term = (convSearch || "").trim();
        loadConversations({
          page: 1,
          limit: 10,
          append: false,
          search: term || undefined,
        });
        refreshUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [convSearch, loadConversations, refreshUnreadCount]);

  // Fallback 3: polling suave cada 30s mientras el widget vive
  useEffect(() => {
    const id = setInterval(() => {
      const term = (convSearch || "").trim();
      loadConversations({
        page: 1,
        limit: 10,
        append: false,
        search: term || undefined,
      });
      refreshUnreadCount();
    }, 30000);
    return () => clearInterval(id);
  }, [convSearch, loadConversations, refreshUnreadCount]);

  // Helpers: display name (first and last token) and date label (Hoy/Ayer/fecha + hora)
  const getDisplayName = (userName, userLastName, fallbackId) => {
    // Preferir primer nombre + primer apellido si vienen separados
    const first = (userName || "").trim().split(/\s+/)[0] || "";
    const firstLast = (userLastName || "").trim().split(/\s+/)[0] || "";
    if (first) return `${first} ${firstLast}`.trim();
    // Fallback: derivar desde una cadena completa (primer token + último token)
    const full = (userName || "").trim();
    if (!full) return `Usuario ${fallbackId ?? ""}`.trim();
    const parts = full.split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };
  const formatDateLabel = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "Hoy";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isYesterday) return "Ayer";
    return d.toLocaleDateString();
  };
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const formatListDateTimeParts = (iso) => {
    if (!iso) return { day: "", time: "" };
    const day = formatDateLabel(iso);
    const time = formatTime(iso);
    return { day, time };
  };

  // Mostrar SOLO para rol USER
  const isUserRole =
    roleName === ROLES.USER ||
    user?.role === ROLES.USER ||
    user?.roleName === ROLES.USER;
  if (!isUserRole) return null;

  return (
    <div
      className={`hidden md:flex flex-row-reverse items-end fixed right-6 bottom-0 z-50 gap-6 transition-all duration-500 ease-in-out ${
        nexoOpen
          ? "opacity-0 pointer-events-none scale-95"
          : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      {/* Contenedor vertical: flotante principal y modal de historial */}
      <div className="flex flex-col items-end pointer-events-none">
        {/* Flotante principal */}
        <div
          className={`bg-white shadow-xl rounded-t-lg rounded-b-none w-[300px] h-[44px] flex items-center justify-between border border-conexia-green hover:ring-2 hover:ring-conexia-green/40 transition-all px-3 relative pointer-events-auto ${open ? "mb-0" : ""}`}
          style={{
            backgroundImage: "url(/bg-smoke2.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: open ? "none" : "1.5px solid #1e6e5c",
          }}
          onClick={(e) => {
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
              <Image
                src={getProfilePictureUrl(avatar)}
                alt="avatar"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white shadow"></span>
            </div>
            {/* Título */}
            <span className="font-semibold text-white text-sm tracking-wide drop-shadow-sm ml-2">
              Mensajes
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Icono redactar (LucidePenSquare) */}
            <button
              className="flex items-center justify-center w-7 h-7 bg-transparent p-0"
              title="Nuevo mensaje"
              style={{ minWidth: 0 }}
              onClick={(e) => {
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
            <div
              className={`flex items-center justify-center w-7 h-7 transition-transform cursor-pointer ${open ? "" : "rotate-180"}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
                setShowContacts(false);
              }}
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                <path
                  d="M8 10l4 4 4-4"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* Modal principal debajo del flotante */}
        {open && (
          <div
            className="w-[300px] h-[420px] bg-white rounded-b-none rounded-t-none shadow-2xl border-x border-conexia-green flex flex-col animate-fadeIn mt-0 pointer-events-auto"
            style={{
              backgroundImage: "url(/bg-smoke.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
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
                    <path
                      d="M15 19l-7-7 7-7"
                      stroke="#1e6e5c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="font-semibold text-conexia-green text-base">
                  Nuevo mensaje
                </span>
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
                    if (e.key === "Escape") setConvSearch("");
                  }}
                />
              </div>
            )}
            {/* Sección de contactos o historial */}
            <div className="flex-1 overflow-y-auto bg-white scrollbar-soft-lg">
              {showContacts ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 font-semibold">
                    Conexiones
                  </div>
                  <div
                    className="flex flex-col gap-0 w-full scrollbar-soft-lg"
                    onScroll={(e) => {
                      const el = e.target;
                      if (
                        el.scrollTop + el.clientHeight >=
                          el.scrollHeight - 40 &&
                        pagination?.hasNextPage &&
                        !loading
                      ) {
                        loadMore();
                      }
                    }}
                    style={{ maxHeight: "340px", overflowY: "auto" }}
                  >
                    {friends.length === 0 && !loading ? (
                      <div className="p-2 text-conexia-green/70 text-center">
                        No tiene contactos aún.
                      </div>
                    ) : (
                      friends.map((friend) => (
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
                              avatar: getProfilePictureUrl(
                                friend.profilePicture,
                              ),
                              name: friend.userName,
                              profession: friend.profession,
                              conversationId: convId,
                            });
                            selectConversation({
                              conversationId: convId,
                              otherUserId: friend.id,
                              otherUser: {
                                id: friend.id,
                                userName: friend.userName,
                                userProfilePicture: friend.profilePicture,
                              },
                            });
                            setShowContacts(false);
                          }}
                        />
                      ))
                    )}
                    {loading && (
                      <div className="p-2 text-conexia-green/70 text-center">
                        Cargando...
                      </div>
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
                      {convSearch.trim() ? "Sin resultados" : "No hay mensajes"}
                    </div>
                  ) : (
                    convs.map((chat) => {
                      const other = chat.otherUser || {};
                      const displayName = getDisplayName(
                        other.userName,
                        other.userLastName,
                        other.id,
                      );
                      const avatarUrl = getProfilePictureUrl(
                        other.userProfilePicture,
                      );
                      const lastMsg = chat.lastMessage || {};
                      // Normalizar preview para evitar mostrar URLs/rutas crudas
                      const looksUrlOrPath = (s) => {
                        if (!s || typeof s !== "string") return false;
                        const v = s.trim();
                        if (!v) return false;
                        if (/^(https?:|blob:|data:)/i.test(v)) return true;
                        if (v.startsWith("/uploads") || v.startsWith("/"))
                          return true;
                        if (
                          /^[\w\-.%/]+\.(png|jpe?g|gif|webp|pdf)(\?.*)?$/i.test(
                            v,
                          )
                        )
                          return true;
                        return false;
                      };
                      const nameL = String(
                        lastMsg?.fileName || "",
                      ).toLowerCase();
                      const urlL = String(lastMsg?.fileUrl || "").toLowerCase();
                      const looksImage =
                        /\.(png|jpe?g|gif|webp)(\?|$)/i.test(nameL) ||
                        /\.(png|jpe?g|gif|webp)(\?|$)/i.test(urlL);
                      const looksPdf =
                        /\.pdf(\?|$)/i.test(nameL) || /\.pdf(\?|$)/i.test(urlL);
                      const contentText =
                        lastMsg.type === "text" ? lastMsg.content || "" : "";
                      const isContentAPath = looksUrlOrPath(contentText);
                      const rawLastContent =
                        contentText && !isContentAPath
                          ? contentText
                          : looksImage
                            ? "Imagen"
                            : looksPdf
                              ? "Documento"
                              : lastMsg.type === "image"
                                ? "Imagen"
                                : lastMsg.type === "pdf"
                                  ? "Documento"
                                  : contentText
                                    ? contentText
                                    : "";
                      const isMine =
                        String(lastMsg.senderId) === String(user?.id);
                      // NUEVO: estado "Escribiendo" en historial flotante
                      const isTyping = !!typingStates?.[other.id];
                      const lastContent = isTyping
                        ? "Escribiendo"
                        : isMine
                          ? `Yo: ${rawLastContent}`
                          : rawLastContent;
                      const { day: dateLabel, time } = formatListDateTimeParts(
                        lastMsg.createdAt,
                      );
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
                          isTyping={isTyping}
                          onClick={() => {
                            setActiveChat({
                              id: other.id,
                              avatar: avatarUrl,
                              name: displayName,
                              conversationId: chat.id,
                            });
                            // pasar también metadatos del otro usuario
                            selectConversation({
                              conversationId: chat.id,
                              otherUserId: other.id,
                              otherUser: {
                                id: other.id,
                                userName: other.userName,
                                userLastName: other.userLastName,
                                userProfilePicture: other.userProfilePicture,
                              },
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
      <div className="flex flex-row-reverse items-end gap-8 pointer-events-none">
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
        .scrollbar-soft-lg::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .scrollbar-soft-lg::-webkit-scrollbar-thumb {
          background: #d3d8d8ff;
          border-radius: 10px;
        }
        .scrollbar-soft-lg::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-soft-lg {
          scrollbar-color: #d3d8d8ff transparent;
          scrollbar-width: auto;
        }
      `}</style>
    </div>
  );
}
