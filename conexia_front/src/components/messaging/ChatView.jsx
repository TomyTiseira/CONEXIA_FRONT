"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import EmojiPicker from "emoji-picker-react";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { useChatMessages } from "@/hooks/messaging/useChatMessages";
import { useUserStore } from "@/store/userStore";
import { config } from "@/config";
import { buildMediaUrl } from "@/utils/mediaUrl";
import {
  ImageIcon,
  FileText,
  ArrowLeft,
  Smile,
  Send,
  X as XIcon,
} from "lucide-react";
import AttachmentPreviewFullWidth from "./AttachmentPreviewFullWidth";

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

export default function ChatView({ user, onBack }) {
  const { user: me, profile } = useUserStore();
  const {
    selectedChatId,
    selectConversation,
    loadConversations,
    refreshUnreadCount,
  } = useMessaging();
  const {
    messages,
    messagesPagination,
    loadMessages,
    sendTextMessage,
    sendFileMessage,
    emitTyping,
    typingStates,
    markCurrentAsRead,
  } = useChatMessages();

  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [fileErr, setFileErr] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // {file, url, type}
  const [imageModal, setImageModal] = useState(null); // { src, name }
  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  // Caches de blobs (igual que en el chat flotante)
  const sentBlobByNameRef = useRef({}); // { 'name|size': blobUrl }
  const imageBlobByMsgRef = useRef({}); // { stableMessageId: blobUrl }
  const pdfBlobByMsgRef = useRef({}); // { stableMessageId: blobUrl }
  const [, force] = useState(0);
  // NUEVO: estado para auto-scroll y badge no leídos
  const [atBottom, setAtBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const [unreadBelow, setUnreadBelow] = useState(0);
  const prevLenRef = useRef(0);
  // Paginación hacia arriba (igual que en el chat flotante)
  const isPrependingRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const localPageRef = useRef(1);
  const [noMoreOlder, setNoMoreOlder] = useState(false);
  // Arma/disarma el disparo de carga: evita encadenar páginas sin que el usuario vuelva a desplazarse
  const canTriggerTopLoadRef = useRef(true);

  const otherTyping = !!(user?.id && typingStates?.[user.id]);

  // Helpers para auth/urls/blobs (tomados del flotante)
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
  const buildCandidateUrls = (u) => {
    if (!u) return [];
    const s = String(u);
    if (s.startsWith("blob:") || /^https?:\/\//i.test(s)) return [s];
    if (s.startsWith("data:")) return []; // data: no fetch
    const candidates = [];
    if (s.startsWith("/uploads")) {
      candidates.push(joinUrl(config.DOCUMENT_URL, s));
    } else if (s.startsWith("/")) {
      candidates.push(joinUrl(config.DOCUMENT_URL, s));
      candidates.push(joinUrl(config.DOCUMENT_URL, `/uploads${s}`));
    } else {
      candidates.push(joinUrl(config.DOCUMENT_URL, `/uploads/${s}`));
      if (config.IMAGE_URL) candidates.push(joinUrl(config.IMAGE_URL, s));
    }
    return candidates;
  };
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

  // REEMPLAZO helpers
  const joinUrl = (b, p) =>
    `${String(b).replace(/\/+$/, "")}/${String(p).replace(/^\/+/, "")}`;
  const getPP = (img) => {
    if (!img) return "/images/default-avatar.png";
    if (
      /^https?:\/\//i.test(img) ||
      img.startsWith("blob:") ||
      img.startsWith("data:")
    )
      return img;
    if (img.startsWith("/images/")) return img; // ← mantener assets públicos locales
    if (img.startsWith("/uploads")) return joinUrl(config.DOCUMENT_URL, img);
    if (img.startsWith("/")) return joinUrl(config.DOCUMENT_URL, img);
    return joinUrl(config.DOCUMENT_URL, `/uploads/${img}`);
  };
  const normFileUrl = (u) => {
    if (!u) return "";
    if (
      /^https?:\/\//i.test(u) ||
      u.startsWith("blob:") ||
      u.startsWith("data:")
    )
      return u;
    if (u.startsWith("/uploads") || u.startsWith("/"))
      return joinUrl(config.DOCUMENT_URL, u);
    return joinUrl(config.DOCUMENT_URL, `/uploads/${u}`);
  };
  // Detecta si un string parece ser únicamente una ruta/URL de archivo y no un texto de mensaje
  const isPurePath = (v) => {
    if (typeof v !== "string") return false;
    const s = v.trim();
    if (!s) return false;
    // URLs y esquemas comunes
    if (/^(https?:|blob:|data:)/i.test(s)) return true;
    // Rutas absolutas del backend
    if (s.startsWith("/uploads") || s.startsWith("/")) return true;
    // Nombre de archivo con extensiones típicas soportadas
    if (/^[\w\-.%/]+\.(png|jpe?g|gif|webp|pdf)(\?.*)?$/i.test(s)) return true;
    return false;
  };
  const formatDateLabel = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "HOY";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "AYER";
    const df = d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return df.replaceAll(".", "").toUpperCase();
  };
  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // Abre modal de imagen con src dado (prioriza URL original de GCS)
  const openImageModal = (src, name, originalMsg) => {
    if (!src) return;
    // Si el mensaje tiene fileUrl o content con URL de GCS, usarla
    let finalSrc = src;
    if (originalMsg) {
      const directUrl = originalMsg.fileUrl || originalMsg.content || "";
      if (typeof directUrl === "string" && /^https?:\/\//i.test(directUrl)) {
        finalSrc = directUrl;
      }
    }
    setImageModal({ src: finalSrc, name: name || "Imagen" });
  };

  // Abre un PDF en nueva pestaña (NUNCA descarga, solo redirige)
  const handlePdfClick = (m, stableId) => {
    try {
      // Prioridad 1: URL directa de GCS o HTTP
      const directUrl = m?.fileUrl || m?.content || "";
      if (typeof directUrl === "string" && /^https?:\/\//i.test(directUrl)) {
        window.open(directUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // Prioridad 2: Cache local blob
      const localById = pdfBlobByMsgRef.current[stableId];
      if (localById) {
        window.open(localById, "_blank", "noopener,noreferrer");
        return;
      }

      const k = nameSizeKey(m?.fileName, m?.fileSize);
      const localByName = sentBlobByNameRef.current[k];
      if (localByName) {
        window.open(localByName, "_blank", "noopener,noreferrer");
        return;
      }

      // Prioridad 3: Data URL o blob URL
      if (
        typeof directUrl === "string" &&
        (directUrl.startsWith("data:") || directUrl.startsWith("blob:"))
      ) {
        window.open(directUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // Prioridad 4: Construir URL local (desarrollo)
      const fileName = directUrl || m?.fileName || "";
      if (fileName) {
        const localUrl = normFileUrl(fileName);
        window.open(localUrl, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("No se encontró URL del PDF");
    } catch (e) {
      console.error("PDF open error", e);
      alert("No se pudo abrir el PDF.");
    }
  };

  // Enviar mensaje (texto y/o archivo pendiente)
  const sendNow = async () => {
    let any = false;
    try {
      // Enviar archivo si está pendiente
      if (pendingFile?.file) {
        const { file, type, name, size, url } = pendingFile;
        // cache local por nombre+tamaño para mostrar al instante
        if (name && size && url) {
          sentBlobByNameRef.current[nameSizeKey(name, size)] = url;
        }
        await sendFileMessage({ file, type });
        any = true;
        setPendingFile(null);
        setFileErr("");
      }
      // Enviar texto si existe
      const txt = (text || "").trim();
      if (txt) {
        await sendTextMessage({ content: txt });
        any = true;
        setText("");
      }
    } catch (e) {
      setFileErr(e?.message || "No se pudo enviar el mensaje");
    } finally {
      emitTyping(false);
      if (any) {
        setShowEmojis(false);
        // asegurar anclado al fondo tras render
        setTimeout(scrollBottom, 30);
        setTimeout(scrollBottom, 220);
      }
    }
  };

  // Selección / unión
  useEffect(() => {
    if (!user?.id) return;
    selectConversation({
      conversationId: user.conversationId || selectedChatId || null,
      otherUserId: user.id,
      otherUser: {
        id: user.id,
        userName: user.name,
        userProfilePicture: user.avatar,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.conversationId]);

  // Cargar mensajes al tener conversación resuelta
  useEffect(() => {
    if (!selectedChatId) return;
    (async () => {
      // Reiniciar contador local de paginación al cambiar de conversación
      localPageRef.current = 1;
      setNoMoreOlder(false);
      canTriggerTopLoadRef.current = true;
      await loadMessages({
        conversationId: selectedChatId,
        page: 1,
        limit: 50,
      });
      scrollBottom();
      setTimeout(scrollBottom, 40);
      try {
        await markCurrentAsRead();
      } finally {
        refreshUnreadCount();
        loadConversations({ page: 1, limit: 20, append: false });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  // Al cambiar de conversación o usuario en la página, limpiar el compositor
  useEffect(() => {
    setText("");
    setPendingFile(null);
    setFileErr("");
    setShowEmojis(false);
    try {
      emitTyping(false);
    } catch {}
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {}
    }
  }, [selectedChatId, user?.id]);

  // REEMPLAZO: auto-scroll en nuevos mensajes (condicional)
  useEffect(() => {
    const el = scrollerRef.current;
    const newLen = messages?.length || 0;
    const prevLen = prevLenRef.current;
    // Si estamos prependeando, no alterar la posición ni contadores
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      prevLenRef.current = newLen;
      return;
    }
    if (newLen > prevLen) {
      const added = newLen - prevLen;
      if (isNearBottom(el)) {
        // pegado al fondo → mantener anclado
        scrollBottom();
        setUnreadBelow(0);
        setShowJump(false);
        setAtBottom(true);
      } else {
        // scrolleado hacia arriba → contar no leídos (solo de otros)
        let inc = 0;
        for (let i = newLen - added; i < newLen; i++) {
          const m = messages[i];
          if (String(m?.senderId) !== String(me?.id)) inc++;
        }
        if (inc > 0) {
          setUnreadBelow((v) => v + inc);
          setShowJump(true);
          setAtBottom(false);
        }
      }
    }
    prevLenRef.current = newLen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  // Si el otro escribe y estamos abajo, mantener anclado al fondo
  useEffect(() => {
    if (otherTyping && atBottom) scrollBottom();
  }, [otherTyping, atBottom]);

  const scrollBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
  const isNearBottom = (el, px = 60) => {
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= px;
  };

  const msgs = useMemo(
    () =>
      (messages || []).map((m) => {
        const content = m.content ?? m.message ?? m.body ?? m.text ?? "";
        return {
          ...m,
          content:
            typeof content === "string" ? content : String(content || ""),
          createdAt: m.createdAt || m.created_at || m.timestamp,
        };
      }),
    [messages],
  );

  // Cargar y reconcilia blobs locales cuando llegan mensajes definitivos (emisor)
  useEffect(() => {
    if (!messages?.length) return;
    messages.forEach((m, idx) => {
      if (String(m?.senderId) !== String(me?.id)) return;
      if (!m?.fileName || !m?.fileSize) return;
      const k = nameSizeKey(m.fileName, m.fileSize);
      const local = sentBlobByNameRef.current[k];
      if (!local) return;
      const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
      const t = String(m?.type || "").toLowerCase();
      const isImg =
        t === "image" ||
        /\.(png|jpe?g|gif|webp)(\?|$)/i.test(m.fileName || "") ||
        /\.(png|jpe?g|gif|webp)(\?|$)/i.test(m.fileUrl || "");
      const isPdf =
        t === "pdf" ||
        /\.pdf(\?|$)/i.test(m.fileName || "") ||
        /\.pdf(\?|$)/i.test(m.fileUrl || "");
      if (isImg && !imageBlobByMsgRef.current[stableId]) {
        imageBlobByMsgRef.current[stableId] = local;
        force((v) => v + 1);
      } else if (isPdf && !pdfBlobByMsgRef.current[stableId]) {
        pdfBlobByMsgRef.current[stableId] = local;
      }
    });
  }, [messages?.length, me?.id]);

  // Precarga imágenes recibidas con auth → blob (receptor)
  useEffect(() => {
    if (!messages?.length) return;
    const ctrl = new AbortController();
    (async () => {
      for (let idx = 0; idx < messages.length; idx++) {
        const m = messages[idx];
        const t = String(m?.type || "").toLowerCase();
        const isImg =
          t === "image" ||
          /\.(png|jpe?g|gif|webp)(\?|$)/i.test(m.fileName || "") ||
          /\.(png|jpe?g|gif|webp)(\?|$)/i.test(m.fileUrl || "");
        if (!isImg) continue;
        const src = m.fileUrl || m.fileName;
        if (
          !src ||
          String(src).startsWith("data:") ||
          String(src).startsWith("blob:")
        )
          continue;
        const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
        if (imageBlobByMsgRef.current[stableId]) continue;
        try {
          const blob = await fetchBlobAuthTry(src, ctrl.signal);
          imageBlobByMsgRef.current[stableId] = URL.createObjectURL(blob);
          force((v) => v + 1);
        } catch {}
      }
    })();
    return () => ctrl.abort();
  }, [messages, me?.id]);

  // Precarga PDFs recibidos → blob (para descarga instantánea)
  useEffect(() => {
    if (!messages?.length) return;
    const ctrl = new AbortController();
    (async () => {
      for (let idx = 0; idx < messages.length; idx++) {
        const m = messages[idx];
        const t = String(m?.type || "").toLowerCase();
        const isPdf =
          t === "pdf" ||
          /\.pdf(\?|$)/i.test(m.fileName || "") ||
          /\.pdf(\?|$)/i.test(m.fileUrl || "");
        if (!isPdf) continue;
        const src = m.fileUrl || m.fileName;
        if (
          !src ||
          String(src).startsWith("data:") ||
          String(src).startsWith("blob:")
        )
          continue;
        const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${idx}`;
        if (pdfBlobByMsgRef.current[stableId]) continue;
        try {
          const blob = await fetchBlobAuthTry(src, ctrl.signal);
          pdfBlobByMsgRef.current[stableId] = URL.createObjectURL(blob);
        } catch {}
      }
    })();
    return () => ctrl.abort();
  }, [messages, me?.id]);

  // Cerrar modal con ESC
  useEffect(() => {
    if (!imageModal) return;
    const h = (e) => {
      if (e.key === "Escape") setImageModal(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [imageModal]);

  // UI
  return (
    <div className="flex flex-col h-full w-full bg-white min-h-0 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-[#f3f9f8] border-b border-[#c6e3e4] shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded hover:bg-[#e0f0f0] text-conexia-green md:hidden"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <img
          src={getPP(user?.avatar)}
          alt="avatar"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover border"
        />
        <div className="min-w-0">
          <div className="font-semibold text-conexia-green truncate text-sm md:text-base">
            {user?.name}
          </div>
          {otherTyping && (
            <div className="text-[11px] text-conexia-green/70">Escribiendo</div>
          )}
        </div>
      </div>

      {/* Mensajes: quitar gran padding inferior (antes pb-40) */}
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 md:px-6 py-2 md:py-4 space-y-3 scrollbar-chat pb-6 md:pb-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          const isBottom = isNearBottom(el);
          setAtBottom(isBottom);
          if (isBottom) {
            setUnreadBelow(0);
            setShowJump(false);
          }

          // Re-armar el disparador cuando el usuario se aleja del tope
          if (el.scrollTop > 120 && !isLoadingMoreRef.current) {
            canTriggerTopLoadRef.current = true;
          }

          // Cargar página anterior cuando se acerca al tope (como chat flotante)
          const hasNext = messagesPagination
            ? (messagesPagination?.hasNextPage ??
              messagesPagination?.currentPage <
                (messagesPagination?.totalPages || 1))
            : true; // fallback: permitir cargar si no conocemos paginación
          if (
            el.scrollTop <= 40 &&
            canTriggerTopLoadRef.current &&
            !isLoadingMoreRef.current &&
            hasNext &&
            selectedChatId
          ) {
            const prevHeight = el.scrollHeight;
            const prevTop = el.scrollTop;
            const currentPage =
              messagesPagination?.currentPage || localPageRef.current || 1;
            const nextPage = currentPage + 1;
            (async () => {
              try {
                isPrependingRef.current = true;
                isLoadingMoreRef.current = true;
                setIsLoadingMore(true);
                canTriggerTopLoadRef.current = false; // desarmar hasta que el usuario vuelva a alejarse del tope
                const pageSize = messagesPagination?.itemsPerPage || 50;
                const data = await loadMessages({
                  conversationId: selectedChatId,
                  page: nextPage,
                  limit: pageSize,
                  append: true,
                  prepend: true,
                });
                // Mantener anclaje al contenido previo
                requestAnimationFrame(() => {
                  const newHeight = el.scrollHeight;
                  el.scrollTop = newHeight - prevHeight + prevTop;
                });
                localPageRef.current = nextPage;
                // Actualizar bandera de fin de historial basándonos en la respuesta
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
                // noop
              } finally {
                isLoadingMoreRef.current = false;
                setIsLoadingMore(false);
              }
            })();
          }
        }}
      >
        {/* Indicador de carga de páginas antiguas */}
        {isLoadingMore && (
          <div className="flex justify-center mt-1">
            <div className="self-center text-xs text-gray-500 flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-conexia-green rounded-full animate-spin" />
              Cargando mensajes…
            </div>
          </div>
        )}
        {/* Banner de fin de historial */}
        {noMoreOlder && !isLoadingMore && (
          <div className="flex justify-center mt-1">
            <div className="self-center text-[11px] px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
              No hay más mensajes
            </div>
          </div>
        )}
        {(() => {
          const items = [];
          let lastDate = "";
          msgs.forEach((m, i) => {
            const isMe = String(m.senderId) === String(me?.id);
            // Derivar tipo si backend mandó texto con ruta
            let t = (m.type || "").toLowerCase();
            const contentPathLike =
              isPurePath(m.content) ||
              (!!m.fileUrl &&
                typeof m.content === "string" &&
                m.content.trim() === String(m.fileUrl).trim()) ||
              (!!m.fileName &&
                typeof m.content === "string" &&
                m.content.trim() === String(m.fileName).trim());
            if (!t || t === "text") {
              if (
                contentPathLike &&
                /\.(png|jpe?g|gif|webp)$/i.test(m.content || "")
              )
                t = "image";
              else if (contentPathLike && /\.pdf$/i.test(m.content || ""))
                t = "pdf";
            }
            const isImg =
              t === "image" ||
              /\.(png|jpe?g|gif|webp)$/i.test(m.fileName || "") ||
              /\.(png|jpe?g|gif|webp)$/i.test(m.fileUrl || "");
            const isPdf =
              t === "pdf" ||
              /\.pdf$/i.test(m.fileName || "") ||
              /\.pdf$/i.test(m.fileUrl || "") ||
              (/\.pdf$/i.test(m.content || "") && contentPathLike);

            const dateLabel = formatDateLabel(m.createdAt);
            if (dateLabel && dateLabel !== lastDate) {
              lastDate = dateLabel;
              items.push(
                <div
                  key={`d-${dateLabel}-${i}`}
                  className="flex justify-center"
                >
                  <span className="inline-block bg-gray-300 text-gray-700 text-[11px] font-medium rounded px-3 py-1 shadow-sm">
                    {dateLabel === "HOY"
                      ? "Hoy"
                      : dateLabel === "AYER"
                        ? "Ayer"
                        : dateLabel}
                  </span>
                </div>,
              );
            }
            const timeChip = (
              <div
                className={`mt-1 text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}
              >
                {formatTime(m.createdAt)}
              </div>
            );

            // PDF (usar descarga robusta como flotante)
            if (isPdf) {
              const fileName =
                m.fileName || (m.fileUrl || m.content || "").split("/").pop();
              const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${i}`;
              items.push(
                <div
                  key={`m-${i}`}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[78%]">
                    <div className="group relative flex items-center gap-3 bg-white border border-conexia-green/30 rounded-lg px-3 py-2 shadow-sm overflow-hidden">
                      <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/image-pdf.png"
                          alt="PDF"
                          className="w-9 h-9 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="truncate-strong text-[13px] font-medium text-gray-700"
                          title={fileName || "Documento"}
                        >
                          {fileName || "Documento"}
                        </div>
                        {m.fileSize && (
                          <div className="text-[11px] text-gray-500">
                            {(m.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePdfClick(m, stableId)}
                        className="absolute inset-0 rounded-lg flex items-center justify-center gap-2 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity text-[12px] text-conexia-green font-medium"
                        title="Ver PDF"
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
              return;
            }

            // Imagen (preferir blob cache/local si existe)
            if (isImg) {
              const primary = normFileUrl(m.fileUrl || m.content || m.fileName);
              const altFromName = m.fileName ? buildMediaUrl(m.fileName) : "";
              const candidates = [primary, altFromName].filter(Boolean);
              const stableId = m.id ?? m.messageId ?? m._id ?? `idx-${i}`;
              const localKey = nameSizeKey(m.fileName, m.fileSize);
              const displaySrc =
                imageBlobByMsgRef.current[stableId] ||
                sentBlobByNameRef.current[localKey] ||
                candidates[0];
              items.push(
                <div
                  key={`m-${i}`}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[78%]">
                    <div
                      className="rounded-lg overflow-hidden border border-conexia-green/30 bg-white p-1 cursor-zoom-in"
                      onClick={() => openImageModal(displaySrc, m.fileName, m)}
                      title="Ver imagen"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displaySrc}
                        alt={m.fileName || "Imagen"}
                        data-try="0"
                        className="object-cover rounded max-h-72 w-full"
                        onError={(ev) => {
                          const el = ev.currentTarget;
                          // Si falló el blob local, pasar a candidatos HTTP
                          const idxTry = Number(
                            el.getAttribute("data-try") || "0",
                          );
                          const next = idxTry + 1;
                          if (next === 1 && candidates[0] !== displaySrc) {
                            el.setAttribute("data-try", "1");
                            el.src = candidates[0];
                          } else if (next < candidates.length) {
                            el.setAttribute("data-try", String(next));
                            el.src = candidates[next];
                          } else {
                            el.src = "/images/image-not-found.png";
                          }
                        }}
                      />
                    </div>
                    {m.content && !contentPathLike && (
                      <div
                        className={`mt-2 px-3 py-2 rounded-lg text-sm long-break ${isMe ? "bg-[#3a8586] text-white" : "bg-[#e1f0f0] text-gray-800"}`}
                      >
                        {renderTextWithLinks(m.content, isMe)}
                      </div>
                    )}
                    {timeChip}
                  </div>
                </div>,
              );
              return;
            }

            // Texto (omitir si es path/URL o replica del fileUrl/fileName)
            const textVal = (m.content || "").trim();
            if (!textVal || contentPathLike) return;
            items.push(
              <div
                key={`m-${i}`}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[78%]">
                  <div
                    className={`px-3 py-2 rounded-lg text-sm whitespace-pre-wrap long-break ${isMe ? "bg-[#3a8586] text-white" : "bg-[#e1f0f0] text-gray-800"}`}
                  >
                    {renderTextWithLinks(textVal, isMe)}
                  </div>
                  {timeChip}
                </div>
              </div>,
            );
          });

          // Indicador: otro usuario escribiendo (estilo chat flotante)
          if (otherTyping) {
            items.push(
              <div
                key="typing-other"
                className="flex items-end gap-2 self-start"
              >
                <img
                  src={getPP(user?.avatar)}
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
        <div className="h-1" />
      </div>

      {/* Botón flota: ir al último con contador de no leídos */}
      {showJump && (
        <button
          type="button"
          onClick={() => {
            scrollBottom();
            setUnreadBelow(0);
            setShowJump(false);
            setAtBottom(true);
          }}
          className="absolute right-3 md:right-4"
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

      {/* Preview adjunto (full-width bar) */}
      {(pendingFile || fileErr) && (
        <div className="px-2 md:px-6 pt-1 mb-1">
          <AttachmentPreviewFullWidth
            attachment={pendingFile}
            error={fileErr}
            onCancel={() => {
              if (pendingFile?.url?.startsWith("blob:")) {
                try {
                  URL.revokeObjectURL(pendingFile.url);
                } catch {}
              }
              setPendingFile(null);
              setFileErr("");
            }}
          />
        </div>
      )}

      {/* Composer: pb solo safe-area + 8px (antes 74px) */}
      <div className="px-2 md:px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] md:pb-3 border-t border-[#c6e3e4] bg-[#f3f9f8] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileErr("");
              if (
                /image\/(png|jpe?g)/.test(file.type) &&
                file.size > 5 * 1024 * 1024
              ) {
                setFileErr("La imagen supera el máximo de 5MB");
                return;
              }
              if (
                file.type === "application/pdf" &&
                file.size > 10 * 1024 * 1024
              ) {
                setFileErr("El PDF supera el máximo de 10MB");
                return;
              }
              const isImg = /image\/(png|jpe?g)/.test(file.type);
              setPendingFile({
                file,
                url: URL.createObjectURL(file),
                type: isImg ? "image" : "pdf",
                name: file.name,
                size: file.size,
              });
            }}
          />
          {!text.trim() && (
            <div className="flex items-center gap-1 px-0.5">
              {/* Imagen: tooltip con extensión y máximo como flotante */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.setAttribute(
                    "accept",
                    "image/png,image/jpeg",
                  );
                  fileInputRef.current?.click();
                }}
                className="p-2 rounded-md hover:bg-white text-conexia-green"
                title="Imagen JPG/PNG · hasta 5MB"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="#1e6e5c"
                    strokeWidth="2"
                  />
                  <circle cx="9" cy="11" r="2.2" fill="#1e6e5c" />
                  <path
                    d="M5 18l5.5-6 3.5 4 3-3 2.5 3"
                    stroke="#1e6e5c"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* PDF: tooltip con máximo como flotante */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.setAttribute(
                    "accept",
                    "application/pdf",
                  );
                  fileInputRef.current?.click();
                }}
                className="p-2 rounded-md hover:bg-white text-conexia-green"
                title="PDF · hasta 10MB"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                    stroke="#1e6e5c"
                    strokeWidth="2"
                  />
                  <path d="M14 2v4h4" stroke="#1e6e5c" strokeWidth="2" />
                  <text
                    x="7"
                    y="16"
                    fontSize="7"
                    fill="#1e6e5c"
                    fontFamily="sans-serif"
                  >
                    PDF
                  </text>
                </svg>
              </button>
            </div>
          )}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              className="w-full border rounded-lg px-3 pr-10 py-2 text-sm bg-white focus:outline-conexia-green h-[40px] leading-normal"
              placeholder="Escribe un mensaje..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                emitTyping(!!e.target.value.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (text.trim() || pendingFile) sendNow();
                }
              }}
              onBlur={() => emitTyping(false)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-conexia-green/70 hover:text-conexia-green"
              title="Emoji"
              onClick={() => setShowEmojis((v) => !v)}
            >
              <Smile size={20} />
            </button>
            {showEmojis && (
              <div className="absolute z-50 bottom-full mb-2 right-0">
                <EmojiPicker
                  onEmojiClick={(e) => {
                    const em = e?.emoji || "";
                    setText((prev) => prev + em);
                    setShowEmojis(false);
                    emitTyping(true);
                  }}
                  height={320}
                  width={300}
                  searchDisabled
                  skinTonesDisabled
                />
              </div>
            )}
          </div>
          <button
            type="button"
            className="bg-conexia-green hover:bg-conexia-green/90 text-white rounded-lg px-3 md:px-4 py-2 text-sm font-medium flex items-center gap-1 disabled:opacity-60"
            disabled={!text.trim() && !pendingFile}
            onClick={sendNow}
            title="Enviar"
          >
            <Send size={16} />
            <span className="hidden md:inline">Enviar</span>
          </button>
        </div>
      </div>

      {/* Modal imagen (clic fuera cierra) */}
      {imageModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div
            className="relative max-w-[92vw] max-h-[88vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow text-gray-700"
              onClick={() => setImageModal(null)}
              title="Cerrar"
            >
              <XIcon size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageModal.src}
              alt={imageModal.name}
              className="max-h-[88vh] max-w-[92vw] object-contain bg-black"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .long-break {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .truncate-strong {
          display: block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .scrollbar-chat::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-chat::-webkit-scrollbar-track {
          background: #f3f9f8;
        }
        .scrollbar-chat::-webkit-scrollbar-thumb {
          background: #cfd9d9;
          border-radius: 6px;
        }
        .scrollbar-chat {
          scrollbar-width: thin;
          scrollbar-color: #cfd9d9 #f3f9f8;
        }

        /* Tres puntos como en el chat flotante */
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
      `}</style>
    </div>
  );
}
