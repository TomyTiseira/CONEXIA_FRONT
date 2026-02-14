// (El antiguo SuccessModal se eliminó; ahora se usa Toast externo)
import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { buildMediaUrl } from "@/utils/mediaUrl";
import dynamic from "next/dynamic";
import { createPublication } from "@/service/publications/publicationsFetch";
import { FaGlobeAmericas, FaUsers } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import MediaPreview from "@/components/ui/MediaPreview";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
const MAX_FILES = 5;
const MAX_VIDEOS = 1;
const FILES_LEGEND =
  "Hasta 5 archivos, solo 1 video por publicación. Formatos permitidos: JPG, PNG, GIF, MP4.";

// Función para validar archivos
const validateFiles = (currentFiles, newFiles) => {
  const totalFiles = [...currentFiles, ...newFiles];

  if (totalFiles.length > MAX_FILES) {
    throw new Error(`Máximo ${MAX_FILES} archivos permitidos`);
  }

  const videoCount = totalFiles.filter((f) =>
    f.type.startsWith("video/"),
  ).length;
  if (videoCount > MAX_VIDEOS) {
    throw new Error(`Máximo ${MAX_VIDEOS} video permitido`);
  }

  newFiles.forEach((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido: ${file.type}`);
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`El archivo ${file.name} excede los 50MB`);
    }
  });

  return true;
};

function VisibilityModal({ open, onClose, value, onChange }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-sm mx-4 animate-fadeIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e0f0f0]">
          <span className="font-semibold text-conexia-green">
            Ajustes de privacidad
          </span>
          <button
            onClick={onClose}
            className="text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors focus:outline-none"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path
                d="M6 6l8 8M14 6l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
          <label className="block text-conexia-green font-semibold">
            Selecciona quién puede ver tu publicación:
          </label>
          <div className="flex flex-col gap-3 ml-6">
            <label className="flex items-center gap-2 cursor-pointer select-none text-base">
              <input
                type="radio"
                checked={value === "all"}
                onChange={() => onChange("all")}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                style={{ accentColor: "#145750" }}
              />
              <FaGlobeAmericas size={22} className="text-conexia-green" />
              <span className="text-gray-700">
                Cualquiera
                <span className="block text-xs text-conexia-green/60">
                  Todo el mundo: dentro y fuera de Conexia
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-base">
              <input
                type="radio"
                checked={value === "contacts"}
                onChange={() => onChange("contacts")}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                style={{ accentColor: "#145750" }}
              />
              <FaUsers size={22} className="text-conexia-green" />
              <span className="text-gray-700">
                Solo amigos
                <span className="block text-xs text-conexia-green/60">
                  Compartir solo con amigos
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 border-t border-[#e0f0f0]">
          <Button
            type="button"
            variant="cancel"
            onClick={onClose}
            className="!px-3 !py-1 !text-sm !rounded-lg"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PublicationModal({ open, onClose, onPublish, user }) {
  const avatar = user?.profilePicture
    ? buildMediaUrl(user.profilePicture)
    : "/images/default-avatar.png";
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]); // array de archivos
  const [fileError, setFileError] = useState("");
  const [visibility, setVisibility] = useState("all"); // 'all' o 'friends'
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef();
  const textareaRef = useRef();
  // Visor de medios (carousel interno antes de publicar)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Ajusta la altura del textarea dinámicamente desde un mínimo hasta un máximo
  const MIN_TEXTAREA_HEIGHT = 38; // 2 líneas aprox
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.max(MIN_TEXTAREA_HEIGHT, textarea.scrollHeight) + "px";
    }
  };
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleClose = () => {
    setDescription("");
    setFiles([]);
    setFileError("");
    setVisibility("all");
    setShowVisibilityModal(false);
    setShowEmoji(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleFileIconClick = (type) => {
    if (fileInputRef.current) {
      let accept = "";
      if (type === "image") accept = "image/jpeg,image/png";
      if (type === "video") accept = "video/mp4";
      if (type === "gif") accept = "image/gif";
      fileInputRef.current.accept = accept;
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    try {
      // Validar archivos antes de agregar
      validateFiles(files, selected);

      // Evitar duplicados por nombre y tamaño
      const allFiles = [...files, ...selected];
      const uniqueFiles = [];
      const fileMap = new Map();

      for (const f of allFiles) {
        const key = `${f.name}_${f.size}`;
        if (!fileMap.has(key)) {
          fileMap.set(key, true);
          uniqueFiles.push(f);
        }
      }

      setFileError("");
      setFiles(uniqueFiles);
    } catch (error) {
      // Mostrar el error pero no bloquear la funcionalidad
      setFileError(error.message);
      // Limpiar el error después de 4 segundos para no bloquear permanentemente
      setTimeout(() => {
        setFileError("");
      }, 4000);
    }
  };

  const handleRemoveFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Ajustar viewerIndex si es necesario
    if (viewerOpen) {
      if (newFiles.length === 0) {
        // Si no quedan archivos, cerrar el viewer
        setViewerOpen(false);
        setViewerIndex(0);
      } else if (viewerIndex >= newFiles.length) {
        // Si el índice actual es mayor que la nueva longitud, ajustar al último archivo
        setViewerIndex(newFiles.length - 1);
      } else if (viewerIndex > idx) {
        // Si eliminamos un archivo antes del actual, decrementar el índice
        setViewerIndex(viewerIndex - 1);
      }
      // Si viewerIndex < idx, no necesitamos hacer nada
    }
  };

  // Abrir visor de medios en índice específico
  const openViewerAt = (idx) => {
    if (idx >= 0 && idx < files.length && files[idx]) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  };
  const closeViewer = () => setViewerOpen(false);
  const nextViewer = (e) => {
    e?.stopPropagation?.();
    if (files.length > 0) {
      setViewerIndex((i) => (i + 1) % files.length);
    }
  };
  const prevViewer = (e) => {
    e?.stopPropagation?.();
    if (files.length > 0) {
      setViewerIndex((i) => (i - 1 + files.length) % files.length);
    }
  };

  const handlePublish = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setSubmitError("");
    let privacy = visibility === "contacts" ? "onlyFriends" : "public";
    try {
      await createPublication({ description, files, privacy });
      // Notificar inmediatamente y cerrar modal
      onPublish && onPublish({ success: true, description, privacy });
      handleClose();
    } catch (err) {
      const msg = err?.message || "Error al crear publicación";
      setSubmitError(msg);
      onPublish && onPublish({ success: false, error: msg });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      description.slice(0, start) + emoji + description.slice(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      adjustTextareaHeight();
    }, 0);
  };
  // Ajustar altura al abrir modal y cuando cambia el texto
  useEffect(() => {
    if (open) {
      setTimeout(() => adjustTextareaHeight(), 0);
    }
  }, [open]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [description]);

  // Efecto para cerrar el viewer si no hay archivos válidos o el índice es inválido
  useEffect(() => {
    if (
      viewerOpen &&
      (files.length === 0 || viewerIndex >= files.length || !files[viewerIndex])
    ) {
      setViewerOpen(false);
      setViewerIndex(0);
    }
  }, [viewerOpen, files.length, viewerIndex, files]);

  if (!open) return null;

  return (
    <>
      <div
        className={
          open
            ? "fixed inset-0 z-50 flex justify-center items-center min-h-screen bg-black/30 backdrop-blur-sm"
            : "hidden"
        }
      >
        <VisibilityModal
          open={showVisibilityModal}
          onClose={() => setShowVisibilityModal(false)}
          value={visibility}
          onChange={(v) => {
            setVisibility(v);
            setShowVisibilityModal(false);
          }}
        />

        <div
          className="relative w-full max-w-2xl mx-2 bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] animate-fadeIn flex flex-col"
          style={{ minHeight: 460, maxHeight: 680 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#e0f0f0] bg-[#eef6f6] rounded-t-2xl">
            <div className="flex items-center gap-3 relative">
              <Image
                src={avatar}
                alt="avatar"
                width={48}
                height={48}
                className="rounded-full aspect-square object-cover"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-conexia-green text-base leading-tight">
                  {user.name}
                </span>
                <button
                  className="flex items-center gap-1 text-xs text-conexia-green/80 bg-[#e0f0f0] px-2.5 py-1 rounded-md border border-[#c6e3e4] hover:bg-[#eef6f6] mt-1 w-fit truncate transition-colors"
                  onClick={() => setShowVisibilityModal(true)}
                >
                  {visibility === "all" ? (
                    <FaGlobeAmericas size={15} className="text-conexia-green" />
                  ) : (
                    <FaUsers size={15} className="text-conexia-green" />
                  )}
                  <span className="truncate">
                    {visibility === "all" ? "Público" : "Solo amigos"}
                  </span>
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 20 20"
                    className="ml-1"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="#1e6e5c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors focus:outline-none"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M6 6l8 8M14 6l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body (scrollable, LinkedIn style) */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 overflow-x-hidden">
            <div className="w-full max-w-xl flex flex-col items-center justify-center">
              {/* Bloque scrolleable: textarea + previews de archivos */}
              <div
                className="flex flex-col w-full"
                style={{ alignItems: "center" }}
              >
                <div
                  className="bg-[#f8fcfc] border border-[#c6e3e4] rounded-t-2xl flex flex-col p-0 relative overflow-y-auto overflow-x-hidden w-full"
                  style={{
                    minHeight: 160,
                    maxHeight: 320,
                    height: 320,
                    margin: 0,
                    borderBottom: "none",
                  }}
                >
                  <div className="flex flex-col gap-2 px-1 pt-3 pb-3 w-full">
                    <textarea
                      ref={textareaRef}
                      className="w-full border-none outline-none bg-transparent resize-none text-conexia-green placeholder:text-conexia-green/50 text-base"
                      placeholder="¿Qué tienes en mente?"
                      maxLength={MAX_DESCRIPTION}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        minHeight: MIN_TEXTAREA_HEIGHT,
                        height: "auto",
                        boxShadow: "none",
                        margin: "8px",
                        paddingBottom: 0,
                        transition: "padding-bottom 0.2s",
                        overflow: "hidden",
                        resize: "none",
                      }}
                      rows={1}
                    />
                    {/* Previews de archivos seleccionados */}
                    <div className="px-2">
                      <MediaPreview
                        files={files}
                        onRemove={handleRemoveFile}
                        maxFiles={MAX_FILES}
                        onSelect={openViewerAt}
                      />
                    </div>
                  </div>
                </div>
                {/* Controles + leyenda (leyenda arriba, sin fondo extra) */}
                <div
                  className="w-full border border-[#c6e3e4] border-t-0 bg-[#f8fcfc] rounded-b-2xl relative"
                  style={{ margin: 0 }}
                >
                  {/* Static error area above legend */}
                  <div className="px-4 pt-2">
                    <div
                      className="min-h-[26px] transition-opacity duration-150 flex items-center justify-center"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {fileError && (
                        <div
                          className="bg-red-50 border border-red-200 text-red-600 text-[11px] px-3 py-1 rounded-md text-center shadow-sm w-full"
                          role="alert"
                        >
                          {fileError}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-conexia-green/60 leading-snug mt-1">
                      {FILES_LEGEND}
                    </div>
                  </div>
                  <div className="h-px bg-[#e0f0f0] mx-3 mt-2" />
                  <div className="flex items-center gap-3 px-3 pt-2 pb-2">
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e0f0f0] text-conexia-green/60 hover:text-conexia-green"
                      onClick={() => setShowEmoji((v) => !v)}
                      title="Emoji"
                    >
                      <BsEmojiSmile />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileIconClick("image")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                      style={{ boxShadow: "none", border: "none" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="3"
                          fill="#e0f0f0"
                          stroke="#1e6e5c"
                          strokeWidth="2"
                        />
                        <circle cx="8" cy="10" r="2" fill="#1e6e5c" />
                        <path
                          d="M21 19l-5.5-7-4.5 6-3-4-4 5"
                          stroke="#1e6e5c"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileIconClick("video")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                      style={{ boxShadow: "none", border: "none" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="3"
                          fill="#e0f0f0"
                          stroke="#1e6e5c"
                          strokeWidth="2"
                        />
                        <polygon points="10,9 16,12 10,15" fill="#1e6e5c" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileIconClick("gif")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                      style={{ boxShadow: "none", border: "none" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="3"
                          fill="#e0f0f0"
                          stroke="#1e6e5c"
                          strokeWidth="2"
                        />
                        <text x="7" y="17" fontSize="8" fill="#1e6e5c">
                          GIF
                        </text>
                      </svg>
                    </button>
                    <span className="text-xs text-conexia-green/50 ml-auto">
                      {description.length}/{MAX_DESCRIPTION}
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />

                {showEmoji && (
                  <div className="absolute bottom-20 left-6 z-50">
                    {/* Overlay para cerrar el picker al hacer click fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      style={{ background: "transparent" }}
                      onClick={() => setShowEmoji(false)}
                    />
                    <div
                      className="relative z-50 bg-white rounded-xl shadow-xl overflow-hidden"
                      style={{ width: 260, height: 260 }}
                    >
                      <Picker
                        onEmojiClick={(emojiData) => {
                          handleEmojiClick(emojiData);
                          setShowEmoji(false);
                        }}
                        theme="light"
                        height={260}
                        width={260}
                        searchDisabled={false}
                        emojiStyle="native"
                        lazyLoadEmojis={true}
                        skinTonesDisabled={false}
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-end gap-2 p-4 border-t border-[#e0f0f0] bg-[#eef6f6] rounded-b-2xl">
            {/* Legend moved: now displayed directly under the editor area above the icon buttons */}
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                type="button"
                variant="cancel"
                onClick={handleClose}
                className="!px-4 !py-2 !rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePublish}
                disabled={
                  !description.trim() ||
                  description.length > MAX_DESCRIPTION ||
                  !!fileError ||
                  loading
                }
                className="!px-6 !py-2 !rounded-lg"
              >
                {loading ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>

          {submitError && (
            <div className="text-red-500 text-xs text-center pb-2">
              {submitError}
            </div>
          )}
        </div>
      </div>
      {viewerOpen && files.length > 0 && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={closeViewer}
        >
          <div
            className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl border border-[#c6e3e4] flex flex-col items-center justify-center p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeViewer}
              className="absolute z-20 top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white text-conexia-green rounded-full shadow-md border border-[#c6e3e4] transition-colors focus:outline-none focus:ring-2 focus:ring-conexia-green/40"
              aria-label="Cerrar visor"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="w-full h-[70vh] flex items-center justify-center relative select-none bg-[#f8fcfc] rounded-xl border border-[#e0f0f0]">
              {files[viewerIndex] &&
              files[viewerIndex].type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(files[viewerIndex])}
                  alt={`Preview ${viewerIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : files[viewerIndex] &&
                files[viewerIndex].type.startsWith("video/") ? (
                <video
                  src={URL.createObjectURL(files[viewerIndex])}
                  controls
                  autoPlay
                  className="max-h-full max-w-full object-contain"
                />
              ) : files[viewerIndex] ? (
                <div className="text-white">Archivo</div>
              ) : (
                <div className="text-white">Error: Archivo no encontrado</div>
              )}
              {files.length > 1 && (
                <>
                  <button
                    onClick={prevViewer}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextViewer}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    {files.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setViewerIndex(i)}
                        className={`w-3 h-3 rounded-full ${i === viewerIndex ? "bg-white" : "bg-white/40"}`}
                        aria-label={`Ir a ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="absolute top-3 left-4 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
                    {viewerIndex + 1} / {files.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
