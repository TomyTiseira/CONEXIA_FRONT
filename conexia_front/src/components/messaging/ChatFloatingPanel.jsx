import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import AttachmentPreview from "./AttachmentPreview";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { useChatMessages } from "@/hooks/messaging/useChatMessages";
import { useUserStore } from "@/store/userStore";
import { config } from "@/config";
import { buildMediaUrl } from "@/utils/mediaUrl";
import { getMessagingSocket } from "@/lib/socket/messagingSocket";

export default function ChatFloatingPanel({
  user,
  onClose,
  disableOutsideClose,
  allowAttachments = true,
}) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  // Persistir estado minimizado en localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("conexia:chat:collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [pendingAttachment, setPendingAttachment] = useState(null); // { file, type, url }
  const [attachmentError, setAttachmentError] = useState(null); // string
  const panelRef = useRef(null);
  const {
    selectedChatId,
    selectedOtherUserId,
    leaveConversation,
    selectConversation,
    loadConversations,
    refreshUnreadCount,
  } = useMessaging(); // <- agrega refreshUnreadCount
  const {
    messages,
    messagesPagination,
    typingStates,
    loadMessages,
    sendTextMessage,
    sendFileMessage,
    emitTyping,
    markCurrentAsRead,
  } = useChatMessages();
  const me = useUserStore((s) => s.user);
  const myProfile = useUserStore((s) => s.profile);
  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  // Fallback robusto: si todavía no está seteado en store, usar el id del prop "user"
  const otherIdForTyping = selectedOtherUserId || user?.id;
  const isOtherTyping = !!(
    otherIdForTyping && typingStates?.[otherIdForTyping]
  );
  const [imageModal, setImageModal] = useState(null); // { url, name }

  // Caches de blobs
  const sentBlobByNameRef = useRef({}); // { 'name|size': blobUrl }
  const imageBlobByMsgRef = useRef({}); // { stableMessageId: blobUrl }
  const pdfBlobByMsgRef = useRef({}); // { stableMessageId: blobUrl }
  const [, force] = useState(0); // para forzar re-render

  const defaultAvatar = "/images/default-avatar.png";
  // Placeholder transparente para usar mientras se carga el blob autenticado
  const transparentGif =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const joinUrl = (base, path) =>
    `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
  const getProfilePictureUrl = (img) => {
    const defaultAvatar = "/images/default-avatar.png";
    if (!img) return defaultAvatar;
    if (typeof img !== "string") return defaultAvatar;
    if (img === defaultAvatar) return defaultAvatar;
    if (img.startsWith("blob:")) return img; // preview blobs
    if (img.startsWith("/images/")) return img; // public asset
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return buildMediaUrl(img);
  };
  const getDisplayName = (userName, fallbackId) => {
    if (!userName || !userName.trim())
      return `Usuario ${fallbackId ?? ""}`.trim();
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };
  const getFileUrl = (u) => {
    // URL para usar en anchors/descargas públicas (si aplica).
    if (!u) return "#";
    if (typeof u !== "string") return "#";
    if (u.startsWith("blob:")) return u;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // Rutas de servidor
    if (u.startsWith("/uploads")) return joinUrl(config.DOCUMENT_URL, u);
    if (u.startsWith("/")) return joinUrl(config.DOCUMENT_URL, u);
    // Nombre suelto → DOCUMENT_URL/uploads/<archivo>
    return joinUrl(config.DOCUMENT_URL, `/uploads/${u}`);
  };

  // URL que SIEMPRE va contra DOCUMENT_URL (para fetch con Authorization)
  const getAuthFileUrl = (u) => {
    if (!u) return "#";
    const s = String(u);
    if (s.startsWith("blob:")) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/uploads")) return joinUrl(config.DOCUMENT_URL, s);
    if (s.startsWith("/")) return joinUrl(config.DOCUMENT_URL, s);
    return joinUrl(config.DOCUMENT_URL, `/uploads/${s}`);
  };

  const formatSizeMB = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Helpers para auth/urls/blobs
  const getAccessToken = () => {
    try {
      return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        ""
      );
    } catch {
      return "";
    }
  };
  const nameSizeKey = (name, size) =>
    `${String(name || "")}|${String(size || "")}`;
  const normalizeType = (t) => {
    const s = String(t || "").toLowerCase();
    if (s === "pdf" || s.endsWith("/pdf") || s === "application/pdf")
      return "pdf";
    if (s === "image" || s.startsWith("image/")) return "image";
    return s || "text";
  };

  const handleFileSelected = (file) => {
    setAttachmentError(null);
    if (!file) return;
    const isImage = /image\/(jpeg|png)/.test(file.type);
    const isPdf = file.type === "application/pdf";
    const type = isImage ? "image" : isPdf ? "pdf" : null;
    if (!type) return;
    const max = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > max) {
      setPendingAttachment(null);
      setAttachmentError(
        isImage
          ? "La imagen supera el máximo de 5MB"
          : "El PDF supera el máximo de 10MB",
      );
      return;
    }
    const url = URL.createObjectURL(file); // para preview inmediata
    setPendingAttachment({ file, type, url, name: file.name, size: file.size });
  };
  // Si no está deshabilitado, cerrar el panel si se hace click fuera
  useEffect(() => {
    if (!disableOutsideClose) {
      const handleClickOutside = (event) => {
        if (panelRef.current && !panelRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [onClose, disableOutsideClose]);

  // Persistir cambios en collapsed
  useEffect(() => {
    try {
      localStorage.setItem("conexia:chat:collapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  // Handler para agregar emoji al mensaje (emoji-picker-react)
  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData?.emoji || "";
    if (emoji) setMessage((prev) => prev + emoji);
    setShowEmojis(false);
  };

  // min-h-0 ensures the inner scroller can actually shrink and scroll inside a flex column
  const containerBase =
    "w-[300px] bg-white rounded-t-lg rounded-b-none shadow-2xl border border-conexia-green border-b-0 flex flex-col relative animate-fadeIn overflow-hidden min-h-0";
  const containerHeight = collapsed ? "h-[44px]" : "h-[420px]";
  const containerZIndex = collapsed ? "z-10" : "z-10";
  const containerPointerEvents = collapsed
    ? "pointer-events-none"
    : "pointer-events-auto";
  const formatDateLabel = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "HOY";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isYesterday) return "AYER";
    const df = d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return df.replaceAll(".", "").toUpperCase();
  };
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const isPrependingRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noMoreOlder, setNoMoreOlder] = useState(false);
  const fillAttemptsRef = useRef(0);
  const localPageRef = useRef(1);
  // Evita cargas encadenadas: requiere alejarse del tope antes de re-disparar
  const canTriggerTopLoadRef = useRef(true);
  // NUEVO: estado para auto-scroll y botón "ir al último" con contador
  const [atBottom, setAtBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const [unreadBelow, setUnreadBelow] = useState(0);
  const prevLenRef = useRef(0);

  // Helper: forzar scroll al último mensaje
  const scrollToBottom = (delay = 0) => {
    const run = () => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };
    if (delay > 0) setTimeout(run, delay);
    else requestAnimationFrame(run);
  };

  // Cargar mensajes cuando cambia la conversación seleccionada o se expande
  useEffect(() => {
    if (!selectedChatId) {
      // Conversación nueva (sin id): mantener vista vacía
      return;
    }
    if (selectedChatId && !collapsed) {
      localPageRef.current = 1;
      setNoMoreOlder(false);
      canTriggerTopLoadRef.current = true;
      fillAttemptsRef.current = 0;
      (async () => {
        try {
          await loadMessages({
            conversationId: selectedChatId,
            page: 1,
            limit: 50,
            append: false,
          });
          // asegurar que se vea lo último al abrir
          scrollToBottom();
          scrollToBottom(50); // segundo tick por si hay imágenes/medidas pendientes
        } finally {
          // marcar leídos y refrescar lista + contador
          setTimeout(async () => {
            try {
              await markCurrentAsRead();
            } finally {
              refreshUnreadCount();
              loadConversations({ page: 1, limit: 10, append: false });
            }
          }, 0);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId, collapsed]);

  // Al expandir el panel (re-abrir), forzar scroll al fondo aunque no cambie messages
  useEffect(() => {
    if (!collapsed) {
      scrollToBottom();
      scrollToBottom(50);
    }
  }, [collapsed]);

  // Helper: ¿estamos cerca del fondo?
  const isNearBottom = (el, px = 60) => {
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= px;
  };

  // Auto-scroll o contar no leídos según posición
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const newLen = messages?.length || 0;
    const prevLen = prevLenRef.current || 0;
    // Reset de prepend: no alterar posición ni contadores
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      prevLenRef.current = newLen;
      return;
    }
    if (newLen > prevLen) {
      const added = newLen - prevLen;
      if (isNearBottom(el)) {
        // si estamos abajo, mantener pegado
        scrollToBottom();
        setUnreadBelow(0);
        setShowJump(false);
        setAtBottom(true);
      } else {
        // contar no leídos de otros
        let inc = 0;
        for (let i = newLen - added; i < newLen; i++) {
          const m = messages[i];
          // Contar solo mensajes del otro usuario (más robusto que "no soy yo" para evitar optimistas sin senderId)
          if (String(m?.senderId) === String(otherIdForTyping)) inc++;
        }
        if (inc > 0) {
          setUnreadBelow((v) => v + inc);
          setShowJump(true);
          setAtBottom(false);
        }
      }
    }
    prevLenRef.current = newLen;
  }, [messages?.length, me?.id]);

  // When other user starts typing, keep pinned only if already at bottom (parity with page ChatView)
  useEffect(() => {
    if (!isOtherTyping) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (isNearBottom(el)) {
      el.scrollTop = el.scrollHeight;
    }
  }, [isOtherTyping, selectedChatId]);

  // Close image modal with Escape key
  useEffect(() => {
    if (!imageModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setImageModal(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [imageModal]);

  const handleSend = async () => {
    // If there's a pending attachment, send it first
    if (pendingAttachment) {
      await confirmSendAttachment();
    }
    if (message.trim()) {
      await sendTextMessage({ content: message.trim() });
      // detener indicador de escritura al enviar
      emitTyping(false);
      setMessage("");
      // refrescar historial + no leídos
      loadConversations({ page: 1, limit: 10, append: false });
      refreshUnreadCount();
      // Ir siempre al fondo al enviar (no mostrar badge por mis mensajes)
      scrollToBottom();
      setUnreadBelow(0);
      setShowJump(false);
      setAtBottom(true);
    }
  };

  // Guardar blob local por nombre|tamaño y NO revocarlo aún
  const confirmSendAttachment = async () => {
    if (!pendingAttachment) return;
    try {
      sentBlobByNameRef.current[
        nameSizeKey(pendingAttachment.name, pendingAttachment.size)
      ] = pendingAttachment.url;
      await sendFileMessage({
        file: pendingAttachment.file,
        type: pendingAttachment.type,
      });
      setPendingAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // refrescar historial + no leídos
      loadConversations({ page: 1, limit: 10, append: false });
      refreshUnreadCount();
      // Ir al fondo tras enviar adjunto
      scrollToBottom();
      setUnreadBelow(0);
      setShowJump(false);
      setAtBottom(true);
    } catch (err) {
      setAttachmentError(err?.message || "Error al enviar archivo");
    }
  };

  // Nuevo: cancelar adjunto pendiente (revoca blob si no se envía)
  const cancelAttachment = () => {
    try {
      if (pendingAttachment?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(pendingAttachment.url);
      }
    } catch {}
    setPendingAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Al llegar mis mensajes definitivos, enganchar el blob local
  useEffect(() => {
    if (!messages?.length) return;
    messages.forEach((m, idx) => {
      const type = normalizeType(m.type);
      if (String(m?.senderId) !== String(me?.id)) return;
      if (!m?.fileName || !m?.fileSize) return;
      const k = nameSizeKey(m.fileName, m.fileSize);
      const local = sentBlobByNameRef.current[k];
      if (!local) return;
      const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
      if (type === "image" && !imageBlobByMsgRef.current[stableId]) {
        imageBlobByMsgRef.current[stableId] = local;
        // no se borra de sentBlobByNameRef: lo mantenemos para re-asignar si cambia el id
        force((v) => v + 1);
      } else if (type === "pdf" && !pdfBlobByMsgRef.current[stableId]) {
        pdfBlobByMsgRef.current[stableId] = local;
        // no se borra de sentBlobByNameRef
      }
    });
  }, [messages?.length, me?.id]);

  // Genera candidatos de URL para un mismo archivo (relativa, nombre suelto, etc.)
  const buildCandidateUrls = (u) => {
    if (!u) return [];
    const s = String(u);
    // si ya es blob o http(s), provar directamente
    if (s.startsWith("blob:") || /^https?:\/\//i.test(s)) return [s];
    // data: no se debe fetch-ear; devolver vacío y manejarlo en UI
    if (s.startsWith("data:")) return [];
    // FIX: candidates debe estar inicializado
    const candidates = [];
    // rutas absolutas del server
    if (s.startsWith("/uploads")) {
      candidates.push(joinUrl(config.DOCUMENT_URL, s));
    } else if (s.startsWith("/")) {
      candidates.push(joinUrl(config.DOCUMENT_URL, s));
      // a veces el backend sirve bajo /uploads aunque llegue /file => probar también
      candidates.push(joinUrl(config.DOCUMENT_URL, `/uploads${s}`));
    } else {
      // nombre suelto
      candidates.push(joinUrl(config.DOCUMENT_URL, `/uploads/${s}`));
      // fallback a CDN público si existe
      if (config.IMAGE_URL) candidates.push(joinUrl(config.IMAGE_URL, s));
    }
    return candidates;
  };

  // Intenta múltiples URLs con credenciales/Authorization hasta que una funcione
  const fetchBlobAuthTry = async (urlOrName, signal) => {
    const token = getAccessToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const candidates = buildCandidateUrls(urlOrName);
    let lastErr;
    for (const href of candidates) {
      try {
        const res = await fetch(href, {
          method: "GET",
          headers,
          credentials: "include",
          signal,
        });
        if (res.ok) return await res.blob();
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("No se pudo obtener el archivo");
  };

  // Reemplaza el fetch directo por el try múltiple (definición única)
  const fetchBlobAuth = async (url, signal) => {
    return fetchBlobAuthTry(url, signal);
  };

  // Descarga genérica con auth (para "file" sin mime/ext fiable)
  const handleGenericFileClick = async (m, stableId) => {
    try {
      let href =
        pdfBlobByMsgRef.current[stableId] ||
        imageBlobByMsgRef.current[stableId];
      if (!href) {
        const k = nameSizeKey(m.fileName, m.fileSize);
        const local = sentBlobByNameRef.current[k];
        if (local) {
          href = local;
        } else if (m.fileUrl || m.fileName) {
          const src = m.fileUrl || m.fileName;
          if (typeof src === "string" && src.startsWith("data:")) {
            href = src;
          } else if (typeof src === "string" && /^https?:\/\//i.test(src)) {
            // URLs externas (GCS, etc.) - usar directamente sin fetch para evitar CORS
            href = src;
          } else {
            const blob = await fetchBlobAuthTry(src);
            href = URL.createObjectURL(blob);
          }
        }
      }
      if (!href) return;
      const a = document.createElement("a");
      a.href = href;
      a.download = m.fileName || "archivo";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {}
  };

  // Precarga imágenes (para receptor y para históricos) con auth -> blob
  useEffect(() => {
    if (!messages?.length) return;
    const ctrl = new AbortController();
    (async () => {
      for (let idx = 0; idx < messages.length; idx++) {
        const m = messages[idx];
        if (normalizeType(m.type) !== "image") continue;
        const urlCandidate = m.fileUrl || m.fileName;
        if (!urlCandidate) continue;
        // Evitar fetch para data:, blob: y URLs externas (GCS)
        const s = String(urlCandidate);
        if (
          s.startsWith("data:") ||
          s.startsWith("blob:") ||
          /^https?:\/\//i.test(s)
        )
          continue;
        const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
        if (imageBlobByMsgRef.current[stableId]) continue;
        try {
          const blob = await fetchBlobAuthTry(urlCandidate, ctrl.signal);
          const href = URL.createObjectURL(blob);
          imageBlobByMsgRef.current[stableId] = href;
          force((v) => v + 1);
        } catch {}
      }
    })();
    return () => ctrl.abort();
  }, [messages, me?.id]);

  // Prefetch de PDFs para descarga instantánea
  useEffect(() => {
    if (!messages?.length) return;
    const ctrl = new AbortController();
    (async () => {
      for (let idx = 0; idx < messages.length; idx++) {
        const m = messages[idx];
        if (normalizeType(m.type) !== "pdf") continue;
        const urlCandidate = m.fileUrl || m.fileName;
        if (!urlCandidate) continue;
        // Evitar fetch para data:, blob: y URLs externas (GCS)
        const s = String(urlCandidate);
        if (
          s.startsWith("data:") ||
          s.startsWith("blob:") ||
          /^https?:\/\//i.test(s)
        )
          continue;
        const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
        if (pdfBlobByMsgRef.current[stableId]) continue;
        try {
          const blob = await fetchBlobAuthTry(urlCandidate, ctrl.signal);
          const href = URL.createObjectURL(blob);
          pdfBlobByMsgRef.current[stableId] = href;
        } catch {}
      }
    })();
    return () => ctrl.abort();
  }, [messages, me?.id]);

  // Descarga PDF (usa blob cache o hace fetch auth y baja)
  const handlePdfClick = async (m, stableId) => {
    try {
      let href = pdfBlobByMsgRef.current[stableId];
      if (!href) {
        const k = nameSizeKey(m.fileName, m.fileSize);
        const local = sentBlobByNameRef.current[k];
        if (local) {
          href = local;
          pdfBlobByMsgRef.current[stableId] = local;
        } else if (m.fileUrl || m.fileName) {
          const src = m.fileUrl || m.fileName;
          if (typeof src === "string" && src.startsWith("data:")) {
            href = src; // abrir/descargar directamente desde data:
            pdfBlobByMsgRef.current[stableId] = href;
          } else if (typeof src === "string" && /^https?:\/\//i.test(src)) {
            // URLs externas (GCS, etc.) - usar directamente sin fetch para evitar CORS
            href = src;
            pdfBlobByMsgRef.current[stableId] = href;
          } else {
            const blob = await fetchBlobAuthTry(src);
            href = URL.createObjectURL(blob);
            pdfBlobByMsgRef.current[stableId] = href;
          }
        }
      }
      if (!href) return;
      // Abrir en nueva pestaña en vez de descargar
      window.open(href, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error al abrir PDF:", err);
    }
  };

  // Abrir imagen en modal (usa blob cache o fetch auth)
  const openImageModalAuth = async (m, stableId) => {
    try {
      let src = imageBlobByMsgRef.current[stableId];
      if (!src) {
        const k = nameSizeKey(m.fileName, m.fileSize);
        const local = sentBlobByNameRef.current[k];
        if (local) {
          src = local;
          imageBlobByMsgRef.current[stableId] = local;
        } else if (m.fileUrl || m.fileName) {
          const u = m.fileUrl || m.fileName;
          if (typeof u === "string" && u.startsWith("data:")) {
            src = u; // usar data: directamente
            imageBlobByMsgRef.current[stableId] = src;
          } else if (typeof u === "string" && /^https?:\/\//i.test(u)) {
            // URLs externas (GCS, etc.) - usar directamente sin fetch para evitar CORS
            src = u;
            imageBlobByMsgRef.current[stableId] = src;
          } else {
            const blob = await fetchBlobAuth(u);
            src = URL.createObjectURL(blob);
            imageBlobByMsgRef.current[stableId] = src;
          }
        }
      }
      if (src) {
        setImageModal({ url: src, name: m.fileName || "Imagen" });
      }
    } catch (err) {
      console.error("Error al abrir imagen:", err);
    }
  };

  // Limpieza de blobs al desmontar
  useEffect(() => {
    return () => {
      Object.values(sentBlobByNameRef.current).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      Object.values(imageBlobByMsgRef.current).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      Object.values(pdfBlobByMsgRef.current).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, []);

  // Fuerza setear el otherUserId y unirse a la sala activa al abrir el panel
  // ANTES: solo si había selectedChatId; AHORA: siempre que conozcamos el otro usuario
  useEffect(() => {
    if (user?.id && String(selectedOtherUserId || "") !== String(user.id)) {
      selectConversation({
        conversationId: selectedChatId || null,
        otherUserId: user.id,
      });
    }
  }, [selectedChatId, user?.id, selectedOtherUserId, selectConversation]);

  // Texto robusto: usa content | message | body | text y fuerza string
  const getTextMessage = (m) => {
    const raw = m?.content ?? m?.message ?? m?.body ?? m?.text ?? "";
    const s = typeof raw === "string" ? raw : String(raw || "");
    return s;
  };

  // Función para renderizar texto con links clickeables
  const renderTextWithLinks = (text, isMe) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:no-underline ${
              isMe
                ? "text-blue-200 hover:text-blue-100"
                : "text-blue-600 hover:text-blue-800"
            }`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Garantizar join a la sala 1-1 al montar el panel (aunque no haya conversationId todavía)
  useEffect(() => {
    if (user?.id) {
      selectConversation({
        conversationId: user.conversationId || selectedChatId || null,
        otherUserId: user.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Al cambiar de conversación o de usuario, limpiar el compositor (evita que queden borradores al abrir otro chat)
  useEffect(() => {
    setMessage("");
    setPendingAttachment(null);
    setAttachmentError(null);
    setShowEmojis(false);
    try {
      emitTyping(false);
    } catch {}
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {}
    }
    // Resetear altura del textarea auto-grow si existe
    try {
      const ta = panelRef.current?.querySelector("textarea");
      if (ta) ta.style.height = "auto";
    } catch {}
  }, [selectedChatId, user?.id]);

  return (
    <div
      ref={panelRef}
      className={`${containerBase} ${containerHeight} ${containerZIndex} ${containerPointerEvents}`}
      style={{ background: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b bg-[#f3f9f8] min-h-[44px] cursor-pointer select-none pointer-events-auto"
        onClick={() => setCollapsed((v) => !v)}
      >
        <Image
          src={getProfilePictureUrl(user?.avatar) || defaultAvatar}
          alt="avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-semibold text-conexia-green text-base truncate">
          {getDisplayName(user?.name, user?.id)}
        </span>
        <button
          className="ml-auto pointer-events-auto"
          title="Cerrar"
          onClick={(e) => {
            e.stopPropagation();
            leaveConversation();
            onClose();
          }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="#1e6e5c"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* Historial de mensajes (simulado) */}
      {!collapsed && (
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-scroll overflow-x-hidden px-3 py-2 bg-white min-h-0 scrollbar-soft"
          onScroll={async (e) => {
            const el = e.currentTarget;
            // actualizar estado de posición respecto del fondo
            const bottom = isNearBottom(el);
            setAtBottom(bottom);
            if (bottom) {
              setUnreadBelow(0);
              setShowJump(false);
            }
            // Re-armar el disparador cuando el usuario se aleja del tope
            if (el.scrollTop > 120 && !isLoadingMoreRef.current) {
              canTriggerTopLoadRef.current = true;
            }
            const hasNext = messagesPagination
              ? (messagesPagination?.hasNextPage ??
                messagesPagination?.currentPage <
                  (messagesPagination?.totalPages || 1))
              : true; // fallback: allow loading when pagination unknown
            if (
              el.scrollTop <= 40 &&
              canTriggerTopLoadRef.current &&
              !isLoadingMoreRef.current &&
              hasNext
            ) {
              const prevHeight = el.scrollHeight;
              const prevTop = el.scrollTop;
              const currentPage =
                messagesPagination?.currentPage || localPageRef.current || 1;
              const nextPage = currentPage + 1;
              try {
                isPrependingRef.current = true;
                isLoadingMoreRef.current = true;
                setIsLoadingMore(true);
                canTriggerTopLoadRef.current = false; // desarmar hasta que el usuario se aleje del tope
                // Only prepend older messages at the top
                const pageSize = messagesPagination?.itemsPerPage || 50;
                const data = await loadMessages({
                  conversationId: selectedChatId,
                  page: nextPage,
                  limit: pageSize,
                  append: true,
                  prepend: true,
                });
                // keep scroll anchored to the same content after prepend
                requestAnimationFrame(() => {
                  const newHeight = el.scrollHeight;
                  el.scrollTop = newHeight - prevHeight + prevTop;
                });
                localPageRef.current = nextPage;
                // Fin de historial: usar hasNextPage si viene; si no, inferir por tamaño de página
                const pageLen = Array.isArray(data?.messages)
                  ? data.messages.length
                  : 0;
                const more =
                  data?.pagination &&
                  typeof data.pagination.hasNextPage === "boolean"
                    ? !!data.pagination.hasNextPage
                    : pageLen >= pageSize;
                if (!more) setNoMoreOlder(true);
              } catch {
              } finally {
                isLoadingMoreRef.current = false;
                setIsLoadingMore(false);
              }
            }
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Top status: Spinner while loading older pages */}
            {isLoadingMore && (
              <div className="self-center text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-conexia-green rounded-full animate-spin" />
                Cargando mensajes…
              </div>
            )}
            {/* No more messages banner */}
            {noMoreOlder && !isLoadingMore && (
              <div className="self-center text-[11px] px-3 py-1 bg-gray-100 text-gray-500 rounded-full mt-1">
                No hay más mensajes
              </div>
            )}
            {(() => {
              const items = [];
              let lastDate = "";
              (messages || []).forEach((m, idx) => {
                const stableId = m.id ?? m.messageId ?? m._id;
                const key =
                  stableId != null
                    ? `m-${stableId}-${idx}`
                    : `m-${m.senderId || "u"}-${m.createdAt || ""}-${idx}`;
                const isMe = m.senderId === me?.id;
                const dayLabel = formatDateLabel(
                  m.createdAt || m.created_at || m.timestamp,
                );
                if (dayLabel && dayLabel !== lastDate) {
                  lastDate = dayLabel;
                  items.push(
                    <div
                      key={`day-${dayLabel}-${idx}`}
                      className="self-center text-[11px] px-3 py-1 bg-gray-200 text-gray-600 rounded-full"
                    >
                      {dayLabel}
                    </div>,
                  );
                }
                const commonLeft = (
                  <Image
                    src={
                      isMe
                        ? getProfilePictureUrl(
                            myProfile?.profilePicture || me?.profilePicture,
                          )
                        : getProfilePictureUrl(user?.avatar)
                    }
                    alt="avatar"
                    width={22}
                    height={22}
                    className="w-[22px] h-[22px] rounded-full object-cover"
                  />
                );
                const timeChip = (
                  <div
                    className={`mt-0.5 text-[10px] text-gray-400 ${isMe ? "self-end" : "self-start"}`}
                  >
                    {formatTime(
                      m.createdAt ||
                        m.created_at ||
                        m.timestamp ||
                        new Date().toISOString(),
                    )}
                  </div>
                );

                // Texto normalizado para decidir si es renderizable
                const textValue = (() => {
                  const raw =
                    m?.content ?? m?.message ?? m?.body ?? m?.text ?? "";
                  return typeof raw === "string"
                    ? raw
                    : String(raw || "").trim();
                })();

                // tipo normalizado (con fallback por nombre/url) PERO solo "text" si hay contenido
                const msgType = (() => {
                  const t = normalizeType(m.type);
                  const name = m.fileName || "";
                  const url = m.fileUrl || "";
                  if (t === "pdf") return "pdf";
                  if (t === "image") return "image";
                  if (t === "text" && textValue) return "text";
                  if (/\.(pdf)(\?|$)/i.test(name) || /\.(pdf)(\?|$)/i.test(url))
                    return "pdf";
                  if (
                    /\.(png|jpe?g|gif|webp)(\?|$)/i.test(name) ||
                    /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url)
                  )
                    return "image";
                  // Fallback: si no hay archivo y el texto está vacío → marcar como "unknown" para no renderizar
                  if (!name && !url && !textValue) return "unknown";
                  // Si hay archivo pero type no llegó claro, tratar como file
                  return name || url ? "file" : "text";
                })();

                // Si no es renderizable, saltar
                if (msgType === "unknown") {
                  return;
                }

                if (msgType === "text") {
                  items.push(
                    <div
                      key={key}
                      className={`flex items-end gap-2 ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      {commonLeft}
                      <div
                        className={`max-w-[72%] min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg text-sm break-words whitespace-pre-wrap ${isMe ? "bg-[#3a8586] text-white" : "bg-[#d6ececff] text-gray-900"}`}
                          style={{
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {renderTextWithLinks(textValue, isMe)}
                        </div>
                        {timeChip}
                      </div>
                    </div>,
                  );
                } else if (msgType === "pdf") {
                  const sid = stableId ?? `idx-${idx}`;
                  items.push(
                    <div
                      key={key}
                      className={`flex items-end gap-2 ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      {commonLeft}
                      <div
                        className={`max-w-[72%] min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`w-full rounded-lg shadow border border-conexia-green/30 bg-white pl-2 pr-2 py-2 flex items-center gap-3 relative group`}
                        >
                          <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/images/image-pdf.png"
                              alt="PDF"
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[13px] font-medium text-gray-700 truncate"
                              title={m.fileName || "Documento"}
                            >
                              {m.fileName || "Documento"}
                            </div>
                            {m.fileSize ? (
                              <div className="text-[11px] text-gray-500">
                                {formatSizeMB(m.fileSize)}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            title="Ver PDF"
                            onClick={() => handlePdfClick(m, sid)}
                            className="absolute inset-0 rounded-lg flex items-center justify-center gap-2 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity text-[12px] text-conexia-green font-medium"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                stroke="#1e6e5c"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                stroke="#1e6e5c"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Ver PDF
                          </button>
                        </div>
                        {timeChip}
                      </div>
                    </div>,
                  );
                } else if (msgType === "image") {
                  const sid = stableId ?? `idx-${idx}`;
                  const imgBlob = imageBlobByMsgRef.current[sid];
                  const localKey = nameSizeKey(m.fileName, m.fileSize);
                  const localBlob = sentBlobByNameRef.current[localKey];
                  // Permitir data: como fuente directa
                  const publicUrl = (() => {
                    const s = String(m.fileUrl || "");
                    return /^https?:\/\//i.test(s) || s.startsWith("data:")
                      ? s
                      : null;
                  })();
                  const displaySrc =
                    imgBlob || localBlob || publicUrl || transparentGif;

                  items.push(
                    <div
                      key={key}
                      className={`flex items-end gap-2 ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      {commonLeft}
                      <div
                        className={`max-w-[72%] min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`w-full rounded-lg overflow-hidden border border-conexia-green/30 bg-white p-1`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displaySrc}
                            alt={m.fileName || "Imagen"}
                            className={`max-h-44 w-full max-w-full object-cover cursor-zoom-in rounded`}
                            onClick={() => openImageModalAuth(m, sid)}
                          />
                        </div>
                        {timeChip}
                      </div>
                    </div>,
                  );
                } else {
                  // file genérico → botón de descarga autenticada
                  const sid = stableId ?? `idx-${idx}`;
                  const label = m.fileName || "Archivo";
                  items.push(
                    <div
                      key={key}
                      className={`flex items-end gap-2 ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      {commonLeft}
                      <div
                        className={`max-w-[72%] min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div className="rounded-lg shadow border border-conexia-green/30 bg-white px-3 py-2 text-sm relative group">
                          <div
                            className="text-conexia-green truncate"
                            title={label}
                          >
                            {label}
                          </div>
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() => handleGenericFileClick(m, sid)}
                            className="absolute inset-0 rounded-lg flex items-center justify-center gap-2 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity text-[12px] text-conexia-green font-medium"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                                stroke="#1e6e5c"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Descargar
                          </button>
                        </div>
                        {timeChip}
                      </div>
                    </div>,
                  );
                }
              });
              // WhatsApp-like typing bubble for the other user
              if (isOtherTyping) {
                const key = `typing-${otherIdForTyping}`;
                items.push(
                  <div key={key} className="flex items-end gap-2 self-start">
                    <Image
                      src={getProfilePictureUrl(user?.avatar)}
                      alt="avatar"
                      width={22}
                      height={22}
                      className="w-[22px] h-[22px] rounded-full object-cover"
                    />
                    <div className="max-w-[72%] items-start flex flex-col">
                      <div className="px-3 py-2 rounded-lg text-sm bg-[#d6ececff] text-gray-900">
                        <div
                          className="typing-dots text-gray-700"
                          aria-label="Escribiendo"
                        >
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
                        </div>
                      </div>
                    </div>
                  </div>,
                );
              }
              return items;
            })()}
          </div>
        </div>
      )}
      {/* Botón flotante: ir al último con contador de no leídos (estilo WhatsApp) */}
      {!collapsed && showJump && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom();
            setUnreadBelow(0);
            setShowJump(false);
            setAtBottom(true);
          }}
          className="absolute right-2"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)" }}
          title="Ir al último"
        >
          <div className="flex items-center gap-2 bg-white border border-[#c6e3e4] text-conexia-green shadow px-3 py-1.5 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="#1e6e5c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadBelow > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-conexia-green text-white text-[11px]">
                {unreadBelow}
              </span>
            )}
          </div>
        </button>
      )}
      {/* Image preview modal */}
      {imageModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Cerrar"
              className="absolute -top-3 -right-3 bg-white rounded-full shadow p-1 text-gray-700 hover:text-gray-900"
              onClick={() => setImageModal(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageModal.url}
              alt={imageModal.name || "Imagen"}
              className="max-h-[82vh] max-w-[82vw] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
      {/* Input de mensaje + emojis */}
      {!collapsed && (
        <div className="px-3 py-2 border-t bg-[#f3f9f8] flex flex-col gap-2">
          {/* Attachment preview / error panel (stacked above composer like LinkedIn) */}
          {(pendingAttachment || attachmentError) && (
            <div className="w-full flex justify-center">
              <AttachmentPreview
                attachment={pendingAttachment}
                error={attachmentError}
                onCancel={cancelAttachment}
                isWide={pendingAttachment?.type === "pdf"}
              />
            </div>
          )}
          {/* Composer row */}
          <div className="flex items-center gap-2 relative">
            {/* Iconos de adjunto (imagen/pdf). Ocultar mientras se escribe */}
            {allowAttachments && !message.trim() && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleFileSelected(file);
                  }}
                />
                {/* Imagen */}
                <button
                  type="button"
                  className="text-conexia-green/70 hover:text-conexia-green"
                  title="Imagen JPG/PNG · hasta 5MB"
                  onClick={() => {
                    fileInputRef.current?.setAttribute(
                      "accept",
                      "image/jpeg,image/png",
                    );
                    fileInputRef.current?.click();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="#1e6e61ff"
                      strokeWidth="2"
                    />
                    <circle cx="8" cy="11" r="2" fill="#1e6e61ff" />
                    <path
                      d="M5 17l4-4 3 3 3-3 4 4"
                      stroke="#1e6e5c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* PDF */}
                <button
                  type="button"
                  className="text-conexia-green/70 hover:text-conexia-green"
                  title="PDF · hasta 10MB"
                  onClick={() => {
                    fileInputRef.current?.setAttribute(
                      "accept",
                      "application/pdf",
                    );
                    fileInputRef.current?.click();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                      stroke="#1e6e5c"
                      strokeWidth="2"
                    />
                    <path d="M14 2v4h4" stroke="#1e6e5c" strokeWidth="2" />
                    <text x="7" y="17" fontSize="7" fill="#1e6e5c">
                      PDF
                    </text>
                  </svg>
                </button>
              </>
            )}
            {/* Emoji picker (simulado) */}
            {showEmojis && (
              <div className="absolute right-0 bottom-full mb-2 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  searchDisabled
                  skinTonesDisabled
                  height={320}
                  width={280}
                />
              </div>
            )}
            {/* Input con botón de emojis adentro y auto-grow */}
            <div className="flex-1 relative">
              <textarea
                rows={1}
                className="w-full border rounded pr-8 pl-2 py-2 text-sm focus:outline-conexia-green resize-none overflow-hidden"
                placeholder="Aa"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  // emitir typing solo si hay texto; si se borra, detener
                  const val = e.target.value;
                  if (val && val.trim().length > 0) {
                    emitTyping(true);
                  } else {
                    emitTyping(false);
                  }
                  const ta = e.target;
                  ta.style.height = "auto";
                  ta.style.height = Math.min(120, ta.scrollHeight) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onBlur={() => emitTyping(false)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 transform text-conexia-green/70 hover:text-conexia-green leading-none flex items-center justify-center h-5 w-5"
                title="Emoji"
                onClick={() => setShowEmojis((v) => !v)}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#1e6e5c"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 14s1.5 2 4 2 4-2 4-2"
                    stroke="#1e6e5c"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="10" r="1" fill="#1e6e5c" />
                  <circle cx="15" cy="10" r="1" fill="#1e6e5c" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="text-conexia-green/70 hover:text-conexia-green"
              title="Enviar"
              onClick={handleSend}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M22 2L11 13"
                  stroke="#1e6e5c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="#1e6e5c"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* typing indicator moved to chat as a bubble */}
          </div>
        </div>
      )}
      <style jsx>{`
        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .typing-dots .dot {
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.6;
          animation: typingBlink 1.2s infinite both;
        }
        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typingBlink {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: translateY(0px);
          }
          40% {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        }

        /* Scrollbar del chat (fina, color celeste claro) */
        .scrollbar-soft::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-soft::-webkit-scrollbar-thumb {
          background: #d3d8d8ff;
          border-radius: 8px;
        }
        .scrollbar-soft::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-soft {
          scrollbar-color: #d3d8d8ff transparent;
          scrollbar-width: thin;
        }
      `}</style>
    </div>
  );
}
