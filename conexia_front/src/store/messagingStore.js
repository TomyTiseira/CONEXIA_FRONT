import { create } from 'zustand';
import { getMessagingSocket, disconnectMessagingSocket } from '@/lib/socket/messagingSocket';
import {
  getConversations,
  getConversationMessages,
  sendTextMessage as sendTextMessageApi,
  sendFileMessage as sendFileMessageApi,
  markMessagesRead as markMessagesReadApi,
  getUnreadCount as getUnreadCountApi,
} from '@/service/messaging';
import { useUserStore } from './userStore';

// Timers para auto-ocultar typing si el backend no envía "stop typing"
const typingTimers = {};
// NUEVO: timers para auto-enviar "stop typing" desde el emisor tras inactividad
const typingOutTimers = {};

// NUEVO: dedupe de mensajes entrantes fuera del chat actual (evita contar 2 veces si llegan 2 eventos del mismo mensaje)
// Mapa en memoria de firmas de mensajes recientes: key -> timestamp ms
const recentIncomingKeys = new Map();
const RECENT_TTL_MS = 90_000; // 90s de retención (limpieza oportunista)
function gcRecentIncoming(now = Date.now()) {
  // limpiar 1/iteración aprox: si el mapa está grande, recorrer parcialmente
  for (const [k, ts] of recentIncomingKeys) {
    if (now - ts > RECENT_TTL_MS) recentIncomingKeys.delete(k);
  }
}
function kindOf(t) {
  const v = String(t || '').toLowerCase();
  if (v.includes('text')) return 'text';
  if (v.includes('image') || v.includes('png') || v.includes('jpg') || v.includes('jpeg') || v.includes('webp') || v.includes('gif')) return 'image';
  if (v.includes('pdf')) return 'pdf';
  if (v.includes('file') || v.includes('attach')) return 'file';
  return v || 'unknown';
}
function baseUrl(u) { return (String(u || '').split('?')[0] || '').toLowerCase(); }
function normText(t) { return (String(t || '')).trim().replace(/\s+/g, ' '); }
function buildIncomingSig(m) {
  const k = kindOf(m?.type);
  const text = k === 'text' ? normText(m?.content) : '';
  const name = String(m?.fileName || '').toLowerCase();
  const size = String(m?.fileSize || '');
  const url = baseUrl(m?.fileUrl);
  const ts = new Date(m?.createdAt || Date.now()).getTime();
  const bucket5s = Math.floor(ts / 5000); // agrupar por ventanas de 5s
  return `${m?.senderId}|${m?.receiverId}|${k}|${text}|${name}|${size}|${url}|${bucket5s}`;
}

export const useMessagingStore = create((set, get) => ({
  // State
  chats: [], // conversations
  chatsPagination: { currentPage: 1, itemsPerPage: 10, totalPages: 0, hasNextPage: false },
  messages: [], // current conversation messages
  messagesPagination: { currentPage: 1, itemsPerPage: 50, totalPages: 0, hasNextPage: false },
  selectedChatId: null,
  selectedOtherUserId: null,
  selectedOtherUserMeta: null, // <- NUEVO: metadatos del contacto seleccionado (id, userName, userProfilePicture)
  loading: false,
  loadingMessages: false,
  error: null,
  socketConnected: false,
  typingStates: {}, // { [userId]: boolean }
  unreadCount: 0,
  lastConversationsReq: 0, // <- NUEVO: control de concurrencia en búsquedas

  // Basic setters
  setSelectedChatId: (id) => set({ selectedChatId: id }),

  // Inserta/actualiza el preview (lastMessage/updatedAt) y mueve la conversación arriba
  upsertConversationPreview: (msg, opts = {}) => {
    const { allowInsert = true, moveTop = true } = opts;
    try {
      const meId = useUserStore.getState().user?.id;
      const otherId = String(msg?.senderId || '') === String(meId || '')
        ? msg?.receiverId
        : msg?.senderId;
      const convId = msg?.conversationId ?? null;
      const updatedAt = msg?.createdAt || new Date().toISOString();
      const lastMessage = {
        id: msg?.id ?? null,
        type: msg?.type || 'text',
        content: msg?.content || null,
        fileName: msg?.fileName || null,
        senderId: msg?.senderId ?? null,
        createdAt: updatedAt,
      };
      set((state) => {
        const chats = state.chats.slice();
        let idx = -1;
        if (convId != null) idx = chats.findIndex(c => String(c.id) === String(convId));
        if (idx === -1 && otherId != null) {
          idx = chats.findIndex(c =>
            String(c.otherUserId) === String(otherId) ||
            String(c.otherUser?.id || '') === String(otherId)
          );
        }

        // datos del otro usuario desde el mensaje (fallback)
        const otherFromMsg = (oid) => {
          // si el otro es el emisor, usa senderName/senderAvatar; si no, intenta receiverName/receiverAvatar (si backend los manda)
          if (String(oid || '') === String(msg?.senderId || '')) {
            return {
              id: oid,
              userName: msg?.senderName || msg?.senderFullName || null,
              userProfilePicture: msg?.senderAvatar || msg?.senderProfilePicture || null,
            };
          }
          return {
            id: oid,
            userName: msg?.receiverName || null,
            userProfilePicture: msg?.receiverAvatar || null,
          };
        };

        if (idx !== -1) {
          const conv = { ...chats[idx], lastMessage, updatedAt };
          if (!conv.otherUser || !conv.otherUser.id) {
            // completar con meta seleccionada o desde el mensaje
            const meta = (String(state.selectedOtherUserMeta?.id || '') === String(otherId || ''))
              ? state.selectedOtherUserMeta
              : otherFromMsg(otherId);
            conv.otherUser = meta || conv.otherUser || null;
            if (!conv.otherUserId && otherId != null) conv.otherUserId = otherId;
          }
          // mover arriba solo si se permite
          if (moveTop) {
            chats.splice(idx, 1);
            chats.unshift(conv);
          } else {
            chats[idx] = conv;
          }
          return { chats };
        }
        // no existe
        if (!allowInsert) return { chats }; // evitar empuje optimista
        const conv = {
          id: convId || `tmp-${Date.now()}`,
          otherUserId: otherId ?? null,
          otherUser:
            (String(state.selectedOtherUserMeta?.id || '') === String(otherId || ''))
              ? state.selectedOtherUserMeta
              : otherFromMsg(otherId),
          lastMessage,
          unreadCount: 0,
          updatedAt,
        };
        chats.unshift(conv);
        return { chats };
      });
    } catch {
      // no-op
    }
  },

  // Load conversations
  loadConversations: async ({ page = 1, limit = 10, append = false, search } = {}) => {
    const reqId = (get().lastConversationsReq || 0) + 1;
    set({ loading: true, error: null, lastConversationsReq: reqId });
    try {
      const data = await getConversations({ page, limit, search });
      // Ignorar si hay una solicitud más nueva en curso
      if (get().lastConversationsReq !== reqId) return;
      set((state) => {
        const incoming = Array.isArray(data.conversations) ? data.conversations : [];

        // Si es append, comportamiento original (agregar al final)
        if (append) {
          return {
            chats: [...(state.chats || []), ...incoming],
            chatsPagination: data.pagination || { currentPage: page, itemsPerPage: limit },
            loading: false,
          };
        }

        // Merge profundo entre "incoming" y "state.chats" para no perder upserts locales (WS) ni unread locales
        const oldList = Array.isArray(state.chats) ? state.chats : [];
        const keyOf = (c) => {
          if (c && c.id != null) return `id:${c.id}`;
          const oid = c?.otherUserId ?? c?.otherUser?.id;
          return oid != null ? `peer:${oid}` : null;
        };
        const byKey = new Map();
        for (const c of oldList) {
          const k = keyOf(c) || `tmp:${Math.random()}`;
          if (!byKey.has(k)) byKey.set(k, c);
        }

        const mergeConv = (prev, inc) => {
          if (!prev) {
            // asegurar forma mínima
            const lm = inc?.lastMessage || null;
            const updatedAt = inc?.updatedAt || lm?.createdAt || null;
            return { ...inc, updatedAt };
          }
          const pickNewerMsg = (a, b) => {
            if (!a) return b || null; if (!b) return a || null;
            const ta = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
            const tb = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
            return tb > ta ? b : a;
          };
          const merged = { ...prev, ...inc };
          // otherUser / ids
          const otherUserId = inc?.otherUserId ?? prev?.otherUserId ?? prev?.otherUser?.id ?? inc?.otherUser?.id ?? null;
          merged.otherUserId = otherUserId;
          merged.otherUser = (inc?.otherUser && (inc.otherUser.id || inc.otherUser.userName)) ? { ...prev?.otherUser, ...inc.otherUser } : (prev?.otherUser || null);
          // unreadCount: conservar el mayor (local puede tener incrementos no reflejados aún en backend)
          merged.unreadCount = Math.max(Number(prev?.unreadCount || 0), Number(inc?.unreadCount || 0));
          // lastMessage: elegir el más reciente
          const bestLast = pickNewerMsg(prev?.lastMessage, inc?.lastMessage);
          merged.lastMessage = bestLast || prev?.lastMessage || inc?.lastMessage || null;
          // updatedAt: máximo entre ambas y lastMessage.createdAt
          const t1 = new Date(prev?.updatedAt || 0).getTime();
          const t2 = new Date(inc?.updatedAt || 0).getTime();
          const t3 = new Date(merged?.lastMessage?.createdAt || 0).getTime();
          const bestTs = Math.max(t1, t2, t3 || 0);
          merged.updatedAt = bestTs ? new Date(bestTs).toISOString() : (inc?.updatedAt || prev?.updatedAt || null);
          return merged;
        };

        const result = [];
        const seen = new Set();
        for (const inc of incoming) {
          const kId = inc && inc.id != null ? `id:${inc.id}` : null;
          const kPeer = (() => {
            const oid = inc?.otherUserId ?? inc?.otherUser?.id;
            return oid != null ? `peer:${oid}` : null;
          })();
          const prev = (kId && byKey.get(kId)) || (kPeer && byKey.get(kPeer)) || null;
          const merged = mergeConv(prev, inc);
          const usedKey = kId || kPeer || keyOf(merged) || `tmp:${Math.random()}`;
          seen.add(usedKey);
          result.push(merged);
        }

        // Si NO es búsqueda, conservar también conversaciones locales que no vinieron del backend (p.ej. upserts RT aún no reflejados)
        if (!search) {
          for (const [k, conv] of byKey.entries()) {
            if (!seen.has(k)) result.push(conv);
          }
        } else {
          // En modo búsqueda, igual mantener unreadCount local si existe para las conversaciones presentes
          // (ya contemplado en mergeConv)
        }

        // Si la conversación actual está abierta, forzar unreadCount=0 localmente
        const openId = state.selectedChatId ? String(state.selectedChatId) : null;
        if (openId) {
          for (let i = 0; i < result.length; i++) {
            if (String(result[i]?.id) === openId) {
              result[i] = { ...result[i], unreadCount: 0 };
            }
          }
        }

        // Ordenar por updatedAt/lastMessage más reciente
        const getTs = (c) => new Date(c?.lastMessage?.createdAt || c?.updatedAt || 0).getTime();
        result.sort((a, b) => getTs(b) - getTs(a));

        return {
          chats: result,
          chatsPagination: data.pagination || { currentPage: page, itemsPerPage: limit },
          loading: false,
        };
      });
    } catch (e) {
      if (get().lastConversationsReq !== reqId) return;
      set({ loading: false, error: e?.message || 'Error al cargar conversaciones' });
    }
  },

  // Select conversation and prepare socket
  selectConversation: async ({ conversationId, otherUserId, otherUser } = {}) => {
    // intentar resolver conversationId por otherUserId si no viene
    const state = get();
    const prevChatId = state.selectedChatId || null;
    const prevOtherId = state.selectedOtherUserId || null;
    let resolvedConversationId = conversationId || null;
    if (!resolvedConversationId && otherUserId) {
      const found = (state.chats || []).find(c =>
        String(c.otherUserId) === String(otherUserId) ||
        String(c.otherUser?.id || '') === String(otherUserId)
      );
      if (found) resolvedConversationId = found.id;
    }

    // guardar selección + metadatos del contacto
    set({
      selectedChatId: resolvedConversationId || null,
      selectedOtherUserId: otherUserId || null,
      selectedOtherUserMeta: otherUser || null,
    });

    // Si cambió la conversación o el usuario, limpiar los mensajes para evitar que queden los de la conversación anterior
    const changed = String(prevChatId || '') !== String(resolvedConversationId || '')
      || String(prevOtherId || '') !== String(otherUserId || '');
    if (changed) {
      set({
        messages: [],
        messagesPagination: { currentPage: 1, itemsPerPage: 50, totalPages: 0, hasNextPage: false },
        loadingMessages: false,
      });
    }

    // enriquecer chats.otherUser si falta
    if (otherUser) {
      set((prev) => {
        const chats = prev.chats.slice();
        const idx = chats.findIndex(c =>
          (resolvedConversationId && String(c.id) === String(resolvedConversationId)) ||
          String(c.otherUserId) === String(otherUserId) ||
          String(c.otherUser?.id || '') === String(otherUserId)
        );
        if (idx !== -1) {
          const conv = { ...chats[idx] };
          conv.otherUser = conv.otherUser && conv.otherUser.id ? { ...conv.otherUser, ...otherUser } : otherUser;
          conv.otherUserId = conv.otherUserId || otherUser.id;
          chats[idx] = conv;
          return { chats };
        }
        return {};
      });
    }

    // Socket join: con conversationId si existe; si no, igual enviar otherUserId (el backend arma sala 1-1 por usuarios)
    const socket = getMessagingSocket();
    if (socket && !get().socketConnected) {
      get().attachSocketListeners();
      set({ socketConnected: true });
    }
    if (socket) {
      socket.emit('joinConversation', { conversationId: resolvedConversationId || null, otherUserId: otherUserId || null });
    }
  },

  // Load messages for current/selected conversation
  loadMessages: async ({ conversationId, page = 1, limit = 50, append = false, prepend = false }) => {
    if (!conversationId) return;

    // Asegura socket y unión a la sala para RT
    try {
      const socket = getMessagingSocket();
      if (socket && !get().socketConnected) {
        get().attachSocketListeners();
        set({ socketConnected: true });
      }
      if (socket && conversationId) {
        const otherUserId = get().selectedOtherUserId;
        socket.emit('joinConversation', { conversationId, otherUserId: otherUserId || null });
      }
    } catch { /* ignore */ }

    set({ loadingMessages: true, error: null });
    try {
      const data = await getConversationMessages({ conversationId, page, limit });

      const normalizeOne = (m) => {
        const msg = { ...m };
        // ids + contenido
        msg.senderId = msg.senderId ?? m.sender_id ?? m.fromId ?? m.from_id ?? null;
        msg.receiverId = msg.receiverId ?? m.receiver_id ?? m.toId ?? m.to_id ?? null;
        const rawContent = m.content ?? m.message ?? m.body ?? m.text ?? '';
        msg.content = typeof rawContent === 'string' ? rawContent : String(rawContent || '');

        msg.createdAt = msg.createdAt || msg.created_at || msg.timestamp || new Date().toISOString();

        // Mapear fileName / fileUrl
        msg.fileName = msg.fileName ?? m.filename ?? null;
        msg.fileUrl = msg.fileUrl ?? m.fileUrl ?? m.file_path ?? m.file ?? null;
        // NUEVO: tamaño del archivo (para reconciliar y cache local)
        msg.fileSize = msg.fileSize ?? m.fileSize ?? m.size ?? null;

        // Nuevo: si backend guardó/retornó la URL (o data:) en content, úsala
        if (!msg.fileUrl && typeof m.content === 'string') {
          const s = m.content;
          if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) {
            msg.fileUrl = s;
          }
        }

        // si no hay URL pero hay nombre, intenta derivar una ruta
        if (!msg.fileUrl && msg.fileName) {
          msg.fileUrl = String(msg.fileName).startsWith('/') ? msg.fileName : `/uploads/${msg.fileName}`;
        }

        const mime = String(m?.mimeType || m?.mimetype || m?.contentType || m?.type || '').toLowerCase();
        const name = String(msg.fileName || '').toLowerCase();
        const url = String(msg.fileUrl || '').toLowerCase();
        const looksPdf = mime.includes('pdf') || name.endsWith('.pdf') || /\.pdf(\?|$)/.test(url);
        const looksImg = mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)(\?|$)/.test(name) || /\.(png|jpg|jpeg|gif|webp)(\?|$)/.test(url);

        if (looksPdf) msg.type = 'pdf';
        else if (looksImg) msg.type = 'image';
        else if (msg.content && !msg.fileUrl && !msg.fileName) msg.type = 'text';
        else msg.type = msg.type || 'file';

        return msg;
      };

      set((state) => {
        // Backend returns newest -> oldest; we render oldest -> newest
        const incomingDesc = (data.messages || []).map(normalizeOne);
        const pageAsc = [...incomingDesc].reverse();
        // Merge preserving chronological order
        const combined = append
          ? (prepend ? [ ...pageAsc, ...state.messages ] : [ ...state.messages, ...pageAsc ])
          : pageAsc;
        // Deduplicate by id while preserving order
        const normalizeId = (m) => m?.id ?? m?.messageId ?? m?._id ?? null;
        const seen = new Set();
        const deduped = [];
        for (const m of combined) {
          const id = normalizeId(m);
          const key = id != null ? String(id) : `-${m.senderId || ''}-${m.createdAt || ''}-${m.tempId || ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(m);
          }
        }
        return {
          messages: deduped,
          messagesPagination: data.pagination || { currentPage: page, itemsPerPage: limit },
          loadingMessages: false,
        };
      });
      return data;
    } catch (e) {
      set({ loadingMessages: false, error: e?.message || 'Error al cargar mensajes' });
      throw e;
    }
  },

  // Send text message (validates self messaging)
  sendTextMessage: async ({ content }) => {
    const { selectedChatId, selectedOtherUserId } = get();
    const me = useUserStore.getState().user;
    if (!me?.id || !selectedOtherUserId) throw new Error('Contexto inválido');
    if (me.id === selectedOtherUserId) throw new Error('No puedes enviarte mensajes a ti mismo');
    if (!content || !content.trim()) throw new Error('El contenido no puede estar vacío');
    // optimistic add BEFORE API to avoid race where socket arrives first
    const now = new Date().toISOString();
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMsg = {
      id: tempId,
      tempId,
      type: 'text',
      content: content.trim(),
      fileUrl: null,
      fileName: null,
      fileSize: null,
      senderId: me.id,
      senderName: me?.userName || me?.name || 'Yo',
      senderAvatar: me?.profilePicture || null,
      receiverId: selectedOtherUserId,
      isRead: false,
      createdAt: now,
      conversationId: selectedChatId || null,
    };
    set((state) => {
      const next = [...state.messages, optimisticMsg];
      
      return { messages: next };
    });
    // Preview optimista: sin insertar ni reordenar
    get().upsertConversationPreview(optimisticMsg, { allowInsert: false, moveTop: false });
    try {
      const data = await sendTextMessageApi({ receiverId: selectedOtherUserId, conversationId: selectedChatId, content: content.trim() });
      // Reconcile: set real conversationId and id if provided to help socket dedupe
      set((state) => {
        const msgs = state.messages.slice();
        const idx = msgs.findIndex(m => m.id === tempId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            id: data?.messageId || msgs[idx].id,
            conversationId: data?.conversationId || msgs[idx].conversationId,
          };
        }
        // If a server message already arrived (different id) with same content/type, prefer server one and remove the optimistic
        const normText = (t) => (t || '').trim().replace(/\s+/g, ' ');
        const isDupOf = (a, b) => {
          if (!a || !b) return false;
          const sameSender = String(a.senderId) === String(b.senderId);
          const sameType = String(a.type).toLowerCase() === String(b.type).toLowerCase();
          const textMatch = sameType && String(a.type).toLowerCase() === 'text' && normText(a.content) === normText(b.content);
          const fileMatch = sameType && (a.fileName && b.fileName && String(a.fileName).toLowerCase() === String(b.fileName).toLowerCase());
          return sameSender && (textMatch || fileMatch);
        };
        if (idx !== -1) {
          const serverIdx = msgs.findIndex((m, j) => j !== idx && isDupOf(m, msgs[idx]));
          if (serverIdx !== -1) {
            // keep the non-temp (server) message
            msgs.splice(idx, 1);
          }
        }
        // Final de-dup by id (keep last occurrence)
        const seen = new Set();
        const dedup = [];
        for (let i = msgs.length - 1; i >= 0; i--) {
          const mid = msgs[i]?.id ?? msgs[i]?.messageId;
          const key = mid != null ? String(mid) : `idx-${i}`;
          if (!seen.has(key)) { seen.add(key); dedup.unshift(msgs[i]); }
        }
  
        return {
          messages: dedup,
          selectedChatId: data?.conversationId || state.selectedChatId,
        };
      });
      // Actualiza preview con ids reales
      get().upsertConversationPreview({
        id: data?.messageId || optimisticMsg.id,
        conversationId: data?.conversationId || selectedChatId,
        type: 'text',
        content: content.trim(),
        fileName: null,
        senderId: me.id,
        receiverId: selectedOtherUserId,
        createdAt: new Date().toISOString(),
      }, { allowInsert: true, moveTop: true });

      // NUEVO: emitir RT por socket para que el receptor lo reciba al instante
      try {
        const socket = getMessagingSocket();
        const convId = data?.conversationId || get().selectedChatId || null;
        if (socket && convId) {
          socket.emit('sendMessage', {
            conversationId: convId,
            receiverId: selectedOtherUserId,
            type: 'text',
            content: content.trim(),
          });
          // Si la conv se creó en ese momento, asegurar join a la sala
          socket.emit('joinConversation', { conversationId: convId, otherUserId: selectedOtherUserId });
        }
      } catch {}

      return data;
    } catch (e) {
  // rollback optimistic message on failure
      set((state) => ({ messages: state.messages.filter(m => m.id !== tempId) }));
      throw e;
    }
  },

  // Send file message
  sendFileMessage: async ({ file, type }) => {
    const { selectedChatId, selectedOtherUserId } = get();
    const me = useUserStore.getState().user;
    if (!me?.id || !selectedOtherUserId) throw new Error('Contexto inválido');

    // optimistic add BEFORE API
    const now = new Date().toISOString();
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMsg = {
      id: tempId,
      tempId,
      type,
      content: null,
      fileUrl: null,
      fileName: file?.name,
      fileSize: file?.size,
      senderId: me.id,
      senderName: me?.userName || me?.name || 'Yo',
      senderAvatar: me?.profilePicture || null,
      receiverId: selectedOtherUserId,
      isRead: false,
      createdAt: now,
      conversationId: selectedChatId || null,
    };
    set((state) => {
      const next = [...state.messages, optimisticMsg];
      return { messages: next };
    });
    // Preview optimista: sin insertar ni reordenar
    get().upsertConversationPreview(optimisticMsg, { allowInsert: false, moveTop: false });

    // 1) Emitir por WebSocket el archivo como base64 (tiempo real)
    try {
      const socket = getMessagingSocket();
      if (socket && selectedOtherUserId) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        const convId = get().selectedChatId || null;
        socket.emit('sendMessage', {
          conversationId: convId,
          receiverId: selectedOtherUserId,
          type,                 // 'image' | 'pdf'
          content: base64,      // data:...;base64,....
          fileName: file?.name, // opcional
        });
        // asegurar pertenecer a la sala
        socket.emit('joinConversation', { conversationId: convId, otherUserId: selectedOtherUserId });
      }
    } catch {
      // si falla, seguimos con HTTP + optimista
    }

    // 2) Mantener REST para persistencia y obtener ids reales
    try {
      const data = await sendFileMessageApi({ receiverId: selectedOtherUserId, conversationId: selectedChatId, file, type });
      set((state) => {
        const msgs = state.messages.slice();
        // Reconciliar por tempId o id
        const idx = msgs.findIndex(m => m.tempId === tempId || m.id === tempId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            id: data?.messageId || msgs[idx].id,
            fileUrl: data?.fileUrl || msgs[idx].fileUrl,
            // opcional: actualizar fileName/Size si REST los retorna
            fileName: data?.fileName || msgs[idx].fileName,
            fileSize: data?.fileSize ?? msgs[idx].fileSize,
            conversationId: data?.conversationId || msgs[idx].conversationId,
          };
        }

        // NUEVO: remover duplicado emitido por socket (no-temp) si existe
        const kind = (t) => String(t || '').toLowerCase().includes('image') ? 'image'
          : String(t || '').toLowerCase().includes('pdf') ? 'pdf'
          : String(t || '').toLowerCase().includes('text') ? 'text' : 'file';
        const base = (u) => (String(u || '').split('?')[0] || '').toLowerCase();
        const close = (a, b) => {
          const ta = new Date(a || 0).getTime(), tb = new Date(b || 0).getTime();
          return Math.abs(ta - tb) <= 60000;
        };
        if (idx !== -1) {
          const ref = msgs[idx];
          const dupIdx = msgs.findIndex((m, j) => {
            if (j === idx) return false;
            if (String(m.senderId) !== String(ref.senderId)) return false;
            if (kind(m.type) !== kind(ref.type)) return false;
            const sameSize = !!(m.fileSize && ref.fileSize && Number(m.fileSize) === Number(ref.fileSize));
            const sameUrl = !!(m.fileUrl && ref.fileUrl && base(m.fileUrl) === base(ref.fileUrl));
            return (sameSize || sameUrl) && close(m.createdAt, ref.createdAt);
          });
          if (dupIdx !== -1) {
            // conservar el que tiene id real (REST)
            msgs.splice(dupIdx, 1);
          }
        }

        // De-dup por id (conservar último)
        const seen = new Set();
        const dedup = [];
        for (let i = msgs.length - 1; i >= 0; i--) {
          const mid = msgs[i]?.id ?? msgs[i]?.messageId;
          const key = mid != null ? String(mid) : `idx-${i}`;
          if (!seen.has(key)) { seen.add(key); dedup.unshift(msgs[i]); }
        }
        return {
          messages: dedup,
          selectedChatId: data?.conversationId || state.selectedChatId,
        };
      });
      // Preview real con ids verdaderos
      get().upsertConversationPreview({
        id: data?.messageId || optimisticMsg.id,
        conversationId: data?.conversationId || selectedChatId,
        type,
        content: null,
        fileName: file?.name,
        fileSize: file?.size,
        senderId: me.id,
        receiverId: selectedOtherUserId,
        createdAt: new Date().toISOString(),
      }, { allowInsert: true, moveTop: true });

      // Unirse a la sala si se creó conversación
      try {
        const socket = getMessagingSocket();
        const convId = data?.conversationId || get().selectedChatId || null;
        if (socket && convId) {
          socket.emit('joinConversation', { conversationId: convId, otherUserId: selectedOtherUserId });
        }
      } catch {}
      return data;
    } catch (e) {
      // rollback si falla HTTP (el mensaje RT ya pudo llegar; evitamos duplicado)
      set((state) => ({ messages: state.messages.filter(m => m.tempId !== tempId && m.id !== tempId) }));
      throw e;
    }
  },

  // Typing indicator
  emitTyping: (isTyping) => {
    const { selectedChatId, selectedOtherUserId } = get();
    const socket = getMessagingSocket();
    if (!socket || !selectedOtherUserId) return;

    // emitir estado actual
    socket.emit('typing', {
      conversationId: selectedChatId || null,
      otherUserId: selectedOtherUserId,
      isTyping: !!isTyping
    });

    // programar auto-stop luego de 2s sin actividad
    try {
      if (typingOutTimers[selectedOtherUserId]) clearTimeout(typingOutTimers[selectedOtherUserId]);
      if (isTyping) {
        typingOutTimers[selectedOtherUserId] = setTimeout(() => {
          const s = getMessagingSocket();
          s?.emit('typing', {
            conversationId: get().selectedChatId || null,
            otherUserId: selectedOtherUserId,
            isTyping: false
          });
          delete typingOutTimers[selectedOtherUserId];
        }, 2000);
      } else {
        delete typingOutTimers[selectedOtherUserId];
      }
    } catch {}
  },

  // Mark current conversation messages as read (for received ones)
  markCurrentAsRead: async () => {
    const { selectedChatId, selectedOtherUserId, messages } = get();
    if (!selectedChatId || !selectedOtherUserId) return;
    const unreadIds = (messages || []).filter(m => !m.isRead && m.senderId === selectedOtherUserId).map(m => m.id);
    if (!unreadIds.length) return;
    try {
      await markMessagesReadApi({ conversationId: selectedChatId, otherUserId: selectedOtherUserId, messageIds: unreadIds });
      // emit socket and update local state
      const socket = getMessagingSocket();
      socket?.emit('markAsRead', { conversationId: selectedChatId, otherUserId: selectedOtherUserId, messageIds: unreadIds });
      set((state) => {
        // Marcar mensajes como leídos en el hilo actual
        const updatedMsgs = state.messages.map(m => unreadIds.includes(m.id) ? { ...m, isRead: true } : m);
        // Poner en 0 el contador no leído de esta conversación en el listado
        const chats = Array.isArray(state.chats) ? state.chats.slice() : [];
        const idx = chats.findIndex(c => String(c.id) === String(selectedChatId));
        if (idx !== -1) {
          chats[idx] = { ...chats[idx], unreadCount: 0 };
        }
        // Ajustar contador global restando lo leído (sin bajar de 0)
        const newGlobal = Math.max(0, Number(state.unreadCount || 0) - unreadIds.length);
        return { messages: updatedMsgs, chats, unreadCount: newGlobal };
      });
    } catch (e) {
      // silent fail
    }
  },

  refreshUnreadCount: async () => {
    try {
      const data = await getUnreadCountApi();
      set({ unreadCount: data?.unreadCount ?? 0 });
    } catch {
      // ignore
    }
  },

  // Socket listeners
  attachSocketListeners: () => {
    const socket = getMessagingSocket();
    if (!socket) return;

    // Evita duplicados
    socket.off('connect');
    socket.off('newMessage');
    socket.off('userTyping');
    socket.off('messagesRead');
    socket.off('messageNotification');

    // Al reconectar, re-unirse a la sala actual aunque no haya conversationId
    socket.on('connect', () => {
      try {
        const { selectedChatId, selectedOtherUserId } = get();
        if (selectedChatId || selectedOtherUserId) {
          socket.emit('joinConversation', {
            conversationId: selectedChatId || null,
            otherUserId: selectedOtherUserId || null
          });
        }
      } catch {}
    });

    socket.on('newMessage', (rawMsg) => {
      const { selectedChatId, selectedOtherUserId } = get();
      const normalizeId = (m) => m?.id ?? m?.messageId ?? m?._id ?? null;

      const msg = { ...rawMsg };

      // ids + contenido
      msg.senderId = msg.senderId ?? rawMsg.sender_id ?? rawMsg.fromId ?? rawMsg.from_id ?? null;
      msg.receiverId = msg.receiverId ?? rawMsg.receiver_id ?? rawMsg.toId ?? rawMsg.to_id ?? null;
      const rawContent = rawMsg.content ?? rawMsg.message ?? rawMsg.body ?? rawMsg.text ?? '';
      msg.content = typeof rawContent === 'string' ? rawContent : String(rawContent || '');

      msg.createdAt = msg.createdAt || msg.created_at || msg.timestamp || new Date().toISOString();

      // Mapear fileName / fileUrl
      msg.fileName = msg.fileName ?? rawMsg.filename ?? rawMsg.fileName ?? null;
      msg.fileUrl = msg.fileUrl ?? rawMsg.fileUrl ?? rawMsg.file_path ?? rawMsg.file ?? null;
      // NUEVO: tamaño de archivo
      msg.fileSize = msg.fileSize ?? rawMsg.fileSize ?? rawMsg.size ?? null;

      // Nuevo: si la URL (o data:) viene en content para archivos, úsala como fileUrl
      if (!msg.fileUrl && typeof rawMsg.content === 'string') {
        const s = rawMsg.content;
        if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) {
          msg.fileUrl = s;
        }
      }

      // Detección de tipo (priorizar type explícito del backend)
      const rawType = String(rawMsg?.type || '').toLowerCase();
      const mime = String(rawMsg?.mimeType || rawMsg?.mimetype || rawMsg?.contentType || '').toLowerCase();
      const name = String(msg.fileName || '').toLowerCase();
      const url = String(msg.fileUrl || '').toLowerCase();
      const looksPdf = rawType === 'pdf' || mime.includes('pdf') || name.endsWith('.pdf') || /\.pdf(\?|$)/.test(url);
      const looksImg = rawType === 'image' || mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)(\?|$)/.test(name) || /\.(png|jpg|jpeg|gif|webp)(\?|$)/.test(url);

      if (looksPdf) msg.type = 'pdf';
      else if (looksImg) msg.type = 'image';
      else if (msg.content && !msg.fileUrl && !msg.fileName) msg.type = 'text';
      else msg.type = msg.type || rawType || 'file';

      const incomingId = normalizeId(msg);

      // Al llegar un mensaje del usuario X, cancelar su estado de typing inmediatamente
      try {
        const meId = useUserStore.getState().user?.id;
        const fromOtherId = String(msg?.senderId || '') !== String(meId || '') ? msg?.senderId : null;
        if (fromOtherId) {
          // limpiar timeout anterior y marcar isTyping=false
          if (typingTimers[fromOtherId]) { clearTimeout(typingTimers[fromOtherId]); delete typingTimers[fromOtherId]; }
          set((state) => ({ typingStates: { ...state.typingStates, [fromOtherId]: false } }));
        }
      } catch {}

  set((state) => {
        const existsById = incomingId != null && state.messages.some((m) => normalizeId(m) === incomingId);

        // NUEVO: reglas utilitarias
        const eq = (a, b) => String(a) === String(b);
        const normText = (t) => (String(t || '')).trim().replace(/\s+/g, ' ');
        const kind = (t) => {
          const v = String(t || '').toLowerCase();
          if (v.includes('text')) return 'text';
          if (v.includes('image') || v.includes('png') || v.includes('jpg') || v.includes('jpeg') || v.includes('webp') || v.includes('gif')) return 'image';
          if (v.includes('pdf')) return 'pdf';
          if (v.includes('file') || v.includes('attach')) return 'file';
          return v || 'unknown';
        };
        const base = (u) => (String(u || '').split('?')[0] || '').toLowerCase();
        const isClose = (a, b) => {
          const ta = new Date(a || 0).getTime();
          const tb = new Date(b || 0).getTime();
          return Math.abs(ta - tb) <= 60000;
        };

        // NUEVO: fallback por participantes si falta conversationId
        const meId = useUserStore.getState().user?.id;
        const samePair =
          meId && selectedOtherUserId &&
          (
            (String(msg.senderId) === String(selectedOtherUserId) && String(msg.receiverId) === String(meId)) ||
            (String(msg.senderId) === String(meId) && String(msg.receiverId) === String(selectedOtherUserId))
          );
        const inCurrentByConv = selectedChatId && msg.conversationId != null && String(msg.conversationId) === String(selectedChatId);
        const inCurrent = !!(inCurrentByConv || samePair);

        if (inCurrent) {
          if (!msg.conversationId && selectedChatId) msg.conversationId = selectedChatId;
          if (existsById) return {};

          // 1) Reconciliar con optimista (temp)
          const isTemp = (m) => !!m?.tempId || String(m?.id || '').startsWith('tmp-');
          let idxTemp = -1;
          for (let i = state.messages.length - 1; i >= 0; i--) {
            const mm = state.messages[i];
            if (!isTemp(mm)) continue;
            const sameSender = eq(mm.senderId, msg.senderId);
            const sameKind = kind(mm.type) === kind(msg.type);
            let sameContent = false;
            if (sameKind) {
              if (kind(mm.type) === 'text') {
                sameContent = normText(mm.content) === normText(msg.content);
              } else {
                const sameSize = !!(mm.fileSize && msg.fileSize && Number(mm.fileSize) === Number(msg.fileSize));
                const sameUrl = !!(mm.fileUrl && msg.fileUrl && base(mm.fileUrl) === base(msg.fileUrl));
                const sameName = !!(mm.fileName && msg.fileName && String(mm.fileName).toLowerCase() === String(msg.fileName).toLowerCase());
                sameContent = sameSize || sameUrl || sameName;
              }
            }
            if (sameSender && sameKind && sameContent && isClose(mm.createdAt, msg.createdAt)) { idxTemp = i; break; }
          }
          if (idxTemp >= 0) {
            const updated = state.messages.slice();
            const merged = { ...updated[idxTemp], ...msg, id: incomingId ?? updated[idxTemp].id };
            if (kind(merged.type) === 'text' && !normText(merged.content)) {
              merged.content = updated[idxTemp].content;
            }
            updated[idxTemp] = merged;
            // de-dup por id
            const seen = new Set();
            const dedup = [];
            for (let i = updated.length - 1; i >= 0; i--) {
              const mid = updated[i]?.id ?? updated[i]?.messageId;
              const key = mid != null ? String(mid) : `idx-${i}`;
              if (!seen.has(key)) { seen.add(key); dedup.unshift(updated[i]); }
            }
            return { messages: dedup };
          }

          // 2) Evitar duplicados entre dos mensajes del servidor (WS + REST)
          const dupIdx = state.messages.findIndex((m) => {
            // ambos no temporales
            if ((m.tempId || String(m.id || '').startsWith('tmp-'))) return false;
            if (String(m.senderId) !== String(msg.senderId)) return false;
            if (kind(m.type) !== kind(msg.type)) return false;
            if (!isClose(m.createdAt, msg.createdAt)) return false;
            if (kind(msg.type) === 'text') return normText(m.content) === normText(msg.content);
            const sameSize = !!(m.fileSize && msg.fileSize && Number(m.fileSize) === Number(msg.fileSize));
            const sameUrl = !!(m.fileUrl && msg.fileUrl && base(m.fileUrl) === base(msg.fileUrl));
            return sameSize || sameUrl;
          });
          if (dupIdx !== -1) {
            // merge info faltante y NO agregar otro
            const updated = state.messages.slice();
            updated[dupIdx] = { ...updated[dupIdx], ...msg, id: incomingId ?? updated[dupIdx].id };
            return { messages: updated };
          }

          // 3) No hay duplicado → agregar
          const appended = [...state.messages, { ...msg, id: incomingId ?? msg.id }];
          // limpiar optimistas blandos si existe no-temp equivalente
          const buildKey = (m) => `${String(m.senderId)}|${kind(m.type)}|${kind(m.type) === 'text' ? normText(m.content) : (String(m.fileSize || '') || base(m.fileUrl || '') || String(m.fileName || '').toLowerCase())}`;
          const isTemp2 = (m) => !!m?.tempId || String(m?.id || '').startsWith('tmp-');
          const nonTemps = appended.filter((m) => !isTemp2(m));
          const nonTempKeys = new Set(nonTemps.map(buildKey));
          const dedupSoft = appended.filter((m) => !(isTemp2(m) && nonTempKeys.has(buildKey(m))));
          return { messages: dedupSoft };
        }

        // fuera del chat abierto → contar como no leído (global)
        // Evitar duplicados si el mismo mensaje llega dos veces (pre y post persistencia)
        if (existsById) return {};
        try {
          const now = Date.now();
          const sig = buildIncomingSig(msg);
          gcRecentIncoming(now);
          if (recentIncomingKeys.has(sig)) {
            // duplicado reciente detectado → no incrementar
            return {};
          }
          recentIncomingKeys.set(sig, now);
        } catch {}
        return { unreadCount: (state.unreadCount || 0) + 1 };
      });

      // Actualizar/insertar preview en el listado de conversaciones y mover arriba
      try {
        get().upsertConversationPreview(msg, { allowInsert: true, moveTop: true });
      } catch {}

      // Incrementar contador no leído por conversación si es mensaje entrante y no estamos en esa conversación
      try {
        const meId = useUserStore.getState().user?.id;
        const { selectedChatId } = get();
        const convId = msg?.conversationId ?? null;
        const otherId = String(msg?.senderId || '') === String(meId || '') ? msg?.receiverId : msg?.senderId;
        const incomingFromOther = String(msg?.senderId || '') !== String(meId || '');
        const inCurrentByConv = selectedChatId && convId != null && String(convId) === String(selectedChatId);
        const inCurrentByPair = false; // ya tratado arriba; aquí sólo queremos las externas
        if (incomingFromOther && !(inCurrentByConv || inCurrentByPair)) {
          // Guardar firma y evitar doble incremento por conversación
          let allowInc = true;
          try {
            const now = Date.now();
            const sig = buildIncomingSig(msg);
            gcRecentIncoming(now);
            if (recentIncomingKeys.has(sig)) {
              allowInc = false;
            } else {
              recentIncomingKeys.set(sig, now);
            }
          } catch {}
          if (!allowInc) return;
          set((state) => {
            const chats = state.chats.slice();
            const idx = chats.findIndex(c =>
              (convId != null && String(c.id) === String(convId)) ||
              String(c.otherUserId) === String(otherId) ||
              String(c.otherUser?.id || '') === String(otherId)
            );
            if (idx !== -1) {
              const conv = { ...chats[idx] };
              conv.unreadCount = (conv.unreadCount || 0) + 1;
              chats[idx] = conv;
              return { chats };
            }
            return {};
          });
        }
      } catch {}
    });
    // Escucha global de "userTyping" => actualiza typingStates[userId] y auto-clear tras 3s
    socket.on('userTyping', ({ userId, isTyping /*, conversationId*/ }) => {
      set((state) => ({ typingStates: { ...state.typingStates, [userId]: !!isTyping } }));
      try {
        if (typingTimers[userId]) { clearTimeout(typingTimers[userId]); delete typingTimers[userId]; }
        if (isTyping) {
          typingTimers[userId] = setTimeout(() => {
            set((prev) => ({ typingStates: { ...prev.typingStates, [userId]: false } }));
            delete typingTimers[userId];
          }, 3000);
        }
      } catch {}
    });
  },

  // Leave conversation on close
  leaveConversation: () => {
    const { selectedChatId, selectedOtherUserId } = get();
    const socket = getMessagingSocket();
    // enviar stop typing antes de salir
    try {
      socket?.emit('typing', { conversationId: selectedChatId || null, otherUserId: selectedOtherUserId || null, isTyping: false });
    } catch {}
    if (socket && selectedChatId) {
      socket.emit('leaveConversation', { conversationId: selectedChatId, otherUserId: selectedOtherUserId || null });
    }
    // limpiar timers locales de typing-out
    try {
      if (selectedOtherUserId && typingOutTimers[selectedOtherUserId]) {
        clearTimeout(typingOutTimers[selectedOtherUserId]);
        delete typingOutTimers[selectedOtherUserId];
      }
    } catch {}
    set({ selectedChatId: null, selectedOtherUserId: null, messages: [], messagesPagination: { currentPage: 1, itemsPerPage: 50, totalPages: 0, hasNextPage: false } });
  },

  // Full disconnect (on logout)
  disconnect: () => {
    disconnectMessagingSocket();
    // Limpia timers de typing
    try {
      Object.keys(typingTimers).forEach((k) => { clearTimeout(typingTimers[k]); delete typingTimers[k]; });
      Object.keys(typingOutTimers).forEach((k) => { clearTimeout(typingOutTimers[k]); delete typingOutTimers[k]; });
    } catch {}
    set({ socketConnected: false, typingStates: {}, selectedChatId: null, selectedOtherUserId: null, messages: [] });
  },
}));
