import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import { BsEmojiSmile } from 'react-icons/bs';
import Image from 'next/image';
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

// Modal de éxito tipo toast (idéntico al de crear publicación)
function SuccessModal({ open }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
      <div className="bg-white border border-[#c6e3e4] rounded-2xl shadow-2xl flex flex-col items-center px-8 py-8 animate-fadeIn">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-conexia-green/10 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#e0f0f0"/><path d="M7 13.5l3 3 7-7" stroke="#1e6e5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-conexia-green text-lg font-semibold mb-2">Publicación actualizada con éxito</div>
      </div>
    </div>
  );
}

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
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [visibility, setVisibility] = useState(initialPrivacy === 'onlyFriends' ? 'contacts' : 'all');
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [removeOriginalMedia, setRemoveOriginalMedia] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef();
  const textareaRef = useRef();

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
    setFile(null);
    setFileError('');
    setVisibility(initialPrivacy === 'onlyFriends' ? 'contacts' : 'all');
    setShowEmoji(false);
    setRemoveOriginalMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => adjustTextareaHeight(), 0);
  }, [initialDescription, initialMediaUrl, initialPrivacy, open]);

  const handleFileIconClick = (type) => {
    if (fileInputRef.current) {
      let accept = '';
      if (type === 'image') accept = 'image/jpeg,image/png';
      if (type === 'video') accept = 'video/mp4';
      if (type === 'gif') accept = 'image/gif';
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Solo se permiten imágenes JPG, PNG, GIF o videos MP4.');
      setFile(null);
      return;
    }
    setFileError('');
    setFile(f);
  };

  const handleRemoveFile = () => {
    if (file) {
      setFile(null);
      setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (initialMediaUrl) {
      setRemoveOriginalMedia(true);
    }
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

  // Nuevo: mostrar modal de éxito y cerrar tras editar
  const handleSave = async () => {
    let privacy = 'public';
    if (visibility === 'contacts') privacy = 'onlyFriends';
    const send = {
      description: description,
      privacy: privacy
    };
    if (file) {
      send.file = file;
      // Si se añade un nuevo archivo, no se debe enviar removeMedia
      send.removeMedia = false;
    } else if (removeOriginalMedia) {
      // Si se elimina el archivo sin añadir uno nuevo, enviar removeMedia: true
      send.removeMedia = true;
      send.file = null;
    }
    // Si onEdit es async, esperar a que termine
    const result = onEdit(send);
    if (result && typeof result.then === 'function') {
      await result;
    }
    setRemoveOriginalMedia(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!open && !showSuccess) return null;

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
          {/* Body (scrollable, LinkedIn style) */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-4">
            <div className="w-full max-w-xl flex flex-col items-center justify-center">
              <div className="flex flex-col w-full" style={{ alignItems: 'center' }}>
                <div
                  className="bg-[#f8fcfc] border border-[#c6e3e4] rounded-t-2xl flex flex-col p-0 relative overflow-y-scroll w-full"
                  style={{
                    minHeight: 160,
                    maxHeight: 280,
                    height: 280,
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
                    {/* Preview archivos SIEMPRE debajo del textarea, dentro del mismo bloque scrolleable */}
                    {file && file.type.startsWith('image/') && file.type !== 'image/gif' && (
                      <div className="relative w-full flex justify-center items-center mt-2 mb-2">
                        <div className="relative w-full flex justify-center" style={{ maxWidth: '480px' }}>
                          <img src={URL.createObjectURL(file)} alt="preview" className="max-h-56 w-full object-contain mx-auto" />
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow"
                            style={{ lineHeight: 1, pointerEvents: 'auto' }}
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {file && file.type === 'video/mp4' && (
                      <div className="relative w-full flex justify-center items-center mt-2 mb-2">
                        <video src={URL.createObjectURL(file)} controls className="max-h-40 w-full max-w-[260px] object-contain mx-auto" style={{ border: 'none', borderRadius: 0, background: 'none', boxShadow: 'none', margin: 0, padding: 0, display: 'block' }} />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow"
                          style={{ lineHeight: 1, pointerEvents: 'auto' }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    )}
                    {file && file.type === 'image/gif' && (
                      <div className="relative w-full flex justify-center items-center mt-2 mb-2">
                        <img src={URL.createObjectURL(file)} alt="preview" className="max-h-40 w-full max-w-[260px] object-contain mx-auto" />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow"
                          style={{ lineHeight: 1, pointerEvents: 'auto' }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    )}
                    {/* Preview original si no hay file */}
                    {!file && initialMediaUrl && !removeOriginalMedia && (
                      <div className="relative w-full flex justify-center items-center mt-2 mb-2">
                        {initialMediaType === 'image' || initialMediaType === 'gif' ? (
                          <img src={initialMediaUrl} alt="media" className="max-h-40 w-full max-w-[260px] object-contain mx-auto" />
                        ) : initialMediaType === 'video' ? (
                          <video src={initialMediaUrl} controls className="max-h-40 w-full max-w-[260px] object-contain mx-auto" />
                        ) : null}
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow"
                          style={{ lineHeight: 1, pointerEvents: 'auto' }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Controles de adjuntos pegados abajo del input, sin separación */}
                <div className="flex items-center gap-3 px-3 py-2 border border-[#c6e3e4] border-t-0 bg-[#f8fcfc] rounded-b-2xl w-full" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e0f0f0] text-conexia-green/60 hover:text-conexia-green"
                    onClick={() => setShowEmoji((v) => !v)}
                    title="Emoji"
                  >
                    <BsEmojiSmile />
                  </button>
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
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                {fileError && <div className="text-red-500 text-xs">{fileError}</div>}
                {showEmoji && (
                  <div className="absolute bottom-20 left-6 z-50">
                    {/* Overlay para cerrar el picker al hacer click fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      style={{ background: 'transparent' }}
                      onClick={() => setShowEmoji(false)}
                    />
                    <div className="relative z-50 bg-white rounded-xl shadow-xl overflow-hidden" style={{ width: 260, height: 260 }}>
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
      <SuccessModal open={showSuccess} />
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

