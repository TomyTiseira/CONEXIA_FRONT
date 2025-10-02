import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import { BsEmojiSmile } from 'react-icons/bs';
import Image from 'next/image';
import MediaPreview from '@/components/ui/MediaPreview';
import { config } from '@/config';
import { buildMediaUrl } from '@/utils/mediaUrl';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILES = 5;
const FILES_LEGEND = 'Hasta 5 archivos. Formatos permitidos: JPG, PNG, GIF, MP4. Máx. 1 video por publicación.';

// buildMediaUrl ahora centralizado en utils/mediaUrl

function VisibilityModal({ open, onClose, value, onChange }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-sm mx-4 animate-fadeIn flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#e0f0f0]">
          <span className="font-semibold text-conexia-green">Ajustes de privacidad</span>
          <button
            onClick={onClose}
            className="text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors focus:outline-none"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
          <label className="block text-conexia-green font-semibold">
            Selecciona quién puede ver tu publicación:
          </label>
          <div className="flex flex-col gap-3 ml-6">
            <label className="flex items-center gap-2 cursor-pointer select-none text-base">
              <input
                type="radio"
                checked={value === 'all'}
                onChange={() => onChange('all')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                style={{ accentColor: '#145750' }}
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
                checked={value === 'contacts'}
                onChange={() => onChange('contacts')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                style={{ accentColor: '#145750' }}
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


export default function EditPublicationModal({ open, onClose, onEdit, loading, initialDescription, initialMediaUrl, initialMediaType, initialPrivacy = 'public', user }) {
  const [description, setDescription] = useState(initialDescription || '');
  const [files, setFiles] = useState([]); // nuevos archivos añadidos
  const [fileError, setFileError] = useState('');
  const [visibility, setVisibility] = useState(initialPrivacy === 'onlyFriends' ? 'contacts' : 'all');
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [removeOriginalMedia, setRemoveOriginalMedia] = useState(false);
  const fileInputRef = useRef();
  const textareaRef = useRef();
  const [originalMediaObj, setOriginalMediaObj] = useState(initialMediaUrl ? { url: buildMediaUrl(initialMediaUrl), type: initialMediaType } : null);

  // Viewer state (combines original media + new files)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Para textarea dinámico
  const MIN_TEXTAREA_HEIGHT = 38;
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(MIN_TEXTAREA_HEIGHT, textarea.scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [description]);

  useEffect(() => {
    setDescription(initialDescription || '');
    setFileError('');
    setVisibility(initialPrivacy === 'onlyFriends' ? 'contacts' : 'all');
    setShowEmoji(false);
    setRemoveOriginalMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFiles([]);
  setOriginalMediaObj(initialMediaUrl ? { url: buildMediaUrl(initialMediaUrl), type: initialMediaType } : null);
    setTimeout(() => adjustTextareaHeight(), 0);
  }, [initialDescription, initialMediaUrl, initialMediaType, initialPrivacy, open]);

  const handleFileIconClick = (type) => {
    if (fileInputRef.current) {
      let accept = '';
      if (type === 'image') accept = 'image/jpeg,image/png';
      if (type === 'video') accept = 'video/mp4';
      if (type === 'gif') accept = 'image/gif';
      fileInputRef.current.accept = accept;
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length + (originalMediaObj && !removeOriginalMedia ? 1 : 0) > MAX_FILES) {
      setFileError(`Máximo ${MAX_FILES} archivos por publicación.`);
      return;
    }
    let error = '';
    let videoCount = files.filter(f => f.type === 'video/mp4').length + ((originalMediaObj && originalMediaObj.type === 'video' && !removeOriginalMedia) ? 1 : 0);
    const newFiles = [];
    for (const f of selected) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        error = 'Solo se permiten imágenes JPG, PNG, GIF o videos MP4.';
        break;
      }
      if (f.type === 'image/jpeg') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const arr = new Uint8Array(ev.target.result);
          if (arr[6] === 0x4A && arr[7] === 0x46 && arr[8] === 0x49 && arr[9] === 0x46 && arr[10] === 0x00) {
            setFileError('No se permite formato JFIF. Usa JPG estándar.');
          }
        };
        reader.readAsArrayBuffer(f.slice(0, 12));
      }
      if (f.type === 'video/mp4') videoCount++;
      newFiles.push(f);
    }
    if (videoCount > 1) {
      setFileError('Solo se permite 1 video por publicación.');
      return;
    }
    if (error) {
      setFileError(error);
      return;
    }
    setFileError('');
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (idx) => {
    // If removing the original media (represented separately)
    if (idx === 0 && originalMediaObj && !removeOriginalMedia) {
      setRemoveOriginalMedia(true);
      return;
    }
    // Adjust index if original media exists at position 0
    const adjustedIdx = originalMediaObj && !removeOriginalMedia ? idx - 1 : idx;
    setFiles(prev => prev.filter((_, i) => i !== adjustedIdx));
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = description.slice(0, start) + emoji + description.slice(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
  };

  const handleSave = async () => {
    let privacy = visibility === 'contacts' ? 'onlyFriends' : 'public';
    const payload = { description, privacy, files };
    if (removeOriginalMedia) payload.removeMedia = true;
    try {
      const maybePromise = onEdit(payload);
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
      onClose();
      // parent should show toast from callback resolution
    } catch (err) {
      // Provide error back to parent through optional error callback style
      console.error('Edit publication failed', err);
      onClose();
    }
  };

  if (!open) return null;

  // Build combined media list for viewer (original first if present & not removed)
  const combinedMedia = [];
  if (originalMediaObj && !removeOriginalMedia) {
    combinedMedia.push({ kind: 'original', ...originalMediaObj });
  }
  files.forEach(f => combinedMedia.push({ kind: 'new', file: f }));

  const openViewerAt = useCallback((idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  }, []);
  const closeViewer = () => setViewerOpen(false);
  const nextViewer = () => setViewerIndex(i => (i + 1) % combinedMedia.length);
  const prevViewer = () => setViewerIndex(i => (i - 1 + combinedMedia.length) % combinedMedia.length);

  return (
    <>
      <div className={open ? "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" : "hidden"}>
        <VisibilityModal
          open={showVisibilityModal}
          onClose={() => setShowVisibilityModal(false)}
          value={visibility}
          onChange={(v) => {
            setVisibility(v);
            setShowVisibilityModal(false);
          }}
        />
  <div className="relative w-full max-w-2xl mx-2 bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] animate-fadeIn flex flex-col" style={{ minHeight: 420, maxHeight: 600, height: 480 }}>
          {/* Header */}
          <div className="p-4 border-b border-[#e0f0f0] bg-[#eef6f6] rounded-t-2xl">
            <div className="flex items-center gap-3 relative">
              <Image
                src={user?.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${require('@/config').config.IMAGE_URL}/${user.profilePicture}`) : '/images/default-avatar.png'}
                alt="avatar"
                width={48}
                height={48}
                className="rounded-full aspect-square object-cover"
                onError={e => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-conexia-green text-base leading-tight">{user?.displayName || 'Usuario'}</span>
                <button
                  className="flex items-center gap-1 text-xs text-conexia-green/80 bg-[#e0f0f0] px-2.5 py-1 rounded-md border border-[#c6e3e4] hover:bg-[#eef6f6] mt-1 w-fit truncate transition-colors"
                  onClick={() => setShowVisibilityModal(true)}
                >
                  {visibility === 'all' ? (
                    <FaGlobeAmericas size={15} className="text-conexia-green" />
                  ) : (
                    <FaUsers size={15} className="text-conexia-green" />
                  )}
                  <span className="truncate">{visibility === 'all' ? 'Público' : 'Solo amigos'}</span>
                  <svg width="13" height="13" fill="none" viewBox="0 0 20 20" className="ml-1"><path d="M6 8l4 4 4-4" stroke="#1e6e5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <button
                onClick={onClose}
                className="absolute top-0 right-0 text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors focus:outline-none"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          {/* Body (scrollable, unified with create modal) */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 overflow-x-hidden">
            <div className="w-full max-w-xl flex flex-col items-center justify-center">
              <div className="flex flex-col w-full" style={{ alignItems: 'center' }}>
                <div
                  className="bg-[#f8fcfc] border border-[#c6e3e4] rounded-t-2xl flex flex-col p-0 relative overflow-y-auto overflow-x-hidden w-full"
                  style={{
                    minHeight: 160,
                    maxHeight: 320,
                    height: 320,
                    margin: 0,
                    borderBottom: 'none',
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
                        height: 'auto',
                        boxShadow: 'none',
                        margin: '8px',
                        paddingBottom: 0,
                        transition: 'padding-bottom 0.2s',
                        overflow: 'hidden',
                        resize: 'none',
                      }}
                      rows={1}
                    />
                    {/* Combined media previews (original + new) */}
                    <div className="px-2">
                      <div className="grid grid-cols-2 gap-3">
                        {combinedMedia.map((item, idx) => {
                          if (item.kind === 'original') {
                            return (
                              <div key={`orig`} className="relative group aspect-square w-full bg-[#eef6f6] border border-[#c6e3e4] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openViewerAt(idx)}>
                                {item.type === 'image' || item.type === 'gif' ? (
                                  <img src={item.url} alt="original" className="object-cover w-full h-full" />
                                ) : item.type === 'video' ? (
                                  <video src={item.url} className="object-cover w-full h-full" />
                                ) : null}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                                >
                                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                              </div>
                            );
                          }
                          const f = item.file;
                          return (
                            <div key={idx} className="relative group aspect-square w-full bg-[#eef6f6] border border-[#c6e3e4] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openViewerAt(idx)}>
                              {f.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(f)} alt={`preview-${idx}`} className="object-cover w-full h-full" />
                              ) : f.type.startsWith('video/') ? (
                                <video src={URL.createObjectURL(f)} className="object-cover w-full h-full" />
                              ) : null}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                                className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {fileError && <div className="text-red-500 text-xs mt-1">{fileError}</div>}
                    </div>
                  </div>
                </div>
                {/* Controls + legend */}
                <div className="w-full border border-[#c6e3e4] border-t-0 bg-[#f8fcfc] rounded-b-2xl" style={{ margin: 0 }}>
                  <div className="px-4 pt-2 pb-1">
                    <div className="text-[11px] text-conexia-green/60 leading-snug">{FILES_LEGEND}</div>
                  </div>
                  <div className="h-px bg-[#e0f0f0] mx-3" />
                  <div className="flex items-center gap-3 px-3 pt-2 pb-2">
                    <div className="relative">
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e0f0f0] text-conexia-green/60 hover:text-conexia-green"
                        onClick={() => setShowEmoji((v) => !v)}
                        title="Emoji"
                      >
                        <BsEmojiSmile />
                      </button>
                      {showEmoji && (
                        <div className="absolute bottom-full mb-2 left-0 z-50">
                          <div className="relative bg-white rounded-xl shadow-xl border border-[#c6e3e4] overflow-hidden" style={{ width:260, height:260 }}>
                            <Picker
                              onEmojiClick={(emojiData) => { handleEmojiClick(emojiData); setShowEmoji(false); }}
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
                    <button type="button" onClick={() => handleFileIconClick('image')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]" style={{ boxShadow: 'none', border: 'none' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><circle cx="8" cy="10" r="2" fill="#1e6e5c"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    <button type="button" onClick={() => handleFileIconClick('video')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]" style={{ boxShadow: 'none', border: 'none' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><polygon points="10,9 16,12 10,15" fill="#1e6e5c"/></svg>
                    </button>
                    <button type="button" onClick={() => handleFileIconClick('gif')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]" style={{ boxShadow: 'none', border: 'none' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text></svg>
                    </button>
                    <span className="text-xs text-conexia-green/50 ml-auto">{description.length}/{MAX_DESCRIPTION}</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} multiple />

                {/* Picker ahora anclado sobre el botón */}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-4 border-t border-[#e0f0f0] bg-[#eef6f6] rounded-b-2xl">
            <Button type="button" variant="cancel" onClick={onClose} className="!px-4 !py-2 !rounded-lg">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!description.trim() || description.length > MAX_DESCRIPTION || !!fileError || loading}
              className="!px-6 !py-2 !rounded-lg"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>

      {viewerOpen && combinedMedia.length > 0 && (
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="w-full h-[70vh] flex items-center justify-center relative select-none bg-[#f8fcfc] rounded-xl border border-[#e0f0f0]">
              {(() => {
                const current = combinedMedia[viewerIndex];
                if (current.kind === 'original') {
                  if (current.type === 'image' || current.type === 'gif') {
                    return <img src={current.url} alt="original" className="max-h-full max-w-full object-contain" />;
                  }
                  if (current.type === 'video') {
                    return <video src={current.url} controls autoPlay className="max-h-full max-w-full object-contain" />;
                  }
                } else if (current.kind === 'new') {
                  const f = current.file;
                  if (f.type.startsWith('image/')) {
                    return <img src={URL.createObjectURL(f)} alt={`preview-${viewerIndex}`} className="max-h-full max-w-full object-contain" />;
                  }
                  if (f.type.startsWith('video/')) {
                    return <video src={URL.createObjectURL(f)} controls autoPlay className="max-h-full max-w-full object-contain" />;
                  }
                }
                return <div className="text-conexia-green">Archivo</div>;
              })()}
              {combinedMedia.length > 1 && (
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
                    {combinedMedia.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setViewerIndex(i)}
                        className={`w-3 h-3 rounded-full ${i === viewerIndex ? 'bg-white' : 'bg-white/40'}`}
                        aria-label={`Ir a ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="absolute top-3 left-4 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
                    {viewerIndex + 1} / {combinedMedia.length}
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

EditPublicationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialDescription: PropTypes.string,
  initialMediaUrl: PropTypes.string,
  initialMediaType: PropTypes.string,
  initialPrivacy: PropTypes.string,
  user: PropTypes.object
};

