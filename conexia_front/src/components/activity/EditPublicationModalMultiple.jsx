"use client";
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import { BsEmojiSmile } from 'react-icons/bs';
import { editPublicationWithMedia } from '@/service/publications/editPublication';
import { config } from '@/config';
import { buildMediaUrl, getMediaUrlFromObject } from '@/utils/mediaUrl';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILES = 5;
const MAX_VIDEOS = 1;
const FILES_LEGEND = 'Hasta 5 archivos. Formatos permitidos: JPG, PNG, GIF, MP4. Máx. 1 video por publicación.';

// (Eliminado buildMediaUrl local duplicado; usamos util central)

// Modal de privacidad
function VisibilityModal({ open, onClose, value, onChange }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-sm mx-4 animate-fadeIn flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#e0f0f0]">
          <span className="font-semibold text-conexia-green">Ajustes de privacidad</span>
          <button onClick={onClose} className="text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors focus:outline-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
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
          <Button type="button" variant="cancel" onClick={onClose} className="!px-3 !py-1 !text-sm !rounded-lg">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Función para validar archivos
const validateFiles = (currentFiles, newFiles) => {
  const totalFiles = [...currentFiles, ...newFiles];
  
  if (totalFiles.length > MAX_FILES) {
    throw new Error(`Máximo ${MAX_FILES} archivos permitidos`);
  }
  
  const videoCount = totalFiles.filter(f => f.type && f.type.startsWith('video/')).length;
  if (videoCount > MAX_VIDEOS) {
    throw new Error(`Máximo ${MAX_VIDEOS} video permitido`);
  }
  
  newFiles.forEach(file => {
    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido: ${file.type || 'desconocido'}`);
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`El archivo ${file.name} excede los 50MB`);
    }
  });
  
  return true;
};

export default function EditPublicationModalMultiple({ 
  open, 
  onClose, 
  onEdit, 
  loading, 
  publication,
  user 
}) {
  const [description, setDescription] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [fileError, setFileError] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  const fileInputRef = useRef();
  const textareaRef = useRef();

  // Lista combinada para previews y viewer (existing activos + nuevos)
  const activeExisting = existingMedia.filter(m => !removedMediaIds.includes(m.id));
  const combinedMedia = [
    ...activeExisting.map(m => ({ kind: 'existing', media: m })),
    ...newFiles.map(f => ({ kind: 'new', file: f }))
  ];

  // Auto-resize textarea similar al modal de creación
  const MIN_TEXTAREA_HEIGHT = 38;
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(MIN_TEXTAREA_HEIGHT, el.scrollHeight) + 'px';
  }, []);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (open && publication) {
      setDescription(publication.description || '');

      // Fallback legacy: si el backend aun usa mediaUrl/mediaType (single) y media[] está vacío
      if ((!publication.media || publication.media.length === 0) && publication.mediaUrl) {
        const legacyType = publication.mediaType || '';
        const mappedFileType = legacyType === 'video' ? 'video/mp4' : legacyType === 'gif' ? 'image/gif' : legacyType === 'image' ? 'image/jpeg' : legacyType;
        const virtualMedia = {
          id: 'legacy-0',
          fileUrl: publication.mediaUrl,
          filename: publication.mediaFilename || publication.mediaUrl.split('/').pop(),
          fileType: mappedFileType || 'image/jpeg'
        };
        setExistingMedia([virtualMedia]);
      } else {
        setExistingMedia(publication.media || []);
      }

      setRemovedMediaIds([]);
      setNewFiles([]);
      setFileError('');
      setSubmitError('');
      // Reset textarea height on open
      setTimeout(() => adjustTextareaHeight(), 0);

      // Mapear privacy del backend al formato del frontend
      if (publication.privacy === 'public') {
        setVisibility('all');
      } else if (publication.privacy === 'onlyFriends') {
        setVisibility('contacts');
      } else {
        setVisibility('all');
      }
    }
  }, [open, publication]);

  // Ajustar altura cuando cambia descripción
  useEffect(() => {
    adjustTextareaHeight();
  }, [description, adjustTextareaHeight]);

  const handleClose = () => {
    setDescription('');
    setNewFiles([]);
    setExistingMedia([]);
    setRemovedMediaIds([]);
    setFileError('');
    setVisibility('all');
    setShowVisibilityModal(false);
    setShowEmoji(false);
    setSubmitError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

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
    const currentExistingCount = existingMedia.length - removedMediaIds.length;
    const totalCurrentFiles = currentExistingCount + newFiles.length;
    
    try {
      // Validar solo el límite total de archivos
      if (totalCurrentFiles + selected.length > MAX_FILES) {
        throw new Error(`Máximo ${MAX_FILES} archivos permitidos. Actualmente tienes ${totalCurrentFiles}.`);
      }
      
      // Validar solo los archivos nuevos seleccionados
      const videoCount = newFiles.filter(f => f.type && f.type.startsWith('video/')).length;
      const newVideoCount = selected.filter(f => f.type && f.type.startsWith('video/')).length;
      
      if (videoCount + newVideoCount > MAX_VIDEOS) {
        throw new Error(`Máximo ${MAX_VIDEOS} video permitido por publicación`);
      }
      
      // Validar cada archivo nuevo
      selected.forEach(file => {
        if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`Tipo de archivo no permitido: ${file.type || 'desconocido'}`);
        }
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          throw new Error(`El archivo ${file.name} excede los 50MB`);
        }
      });
      
      setFileError('');
      setNewFiles(prev => [...prev, ...selected]);
    } catch (error) {
      setFileError(error.message);
    }
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setFileError('');
  };

  const handleRemoveExistingMedia = (mediaId) => {
    setRemovedMediaIds(prev => [...prev, mediaId]);
  };

  const handleRestoreExistingMedia = (mediaId) => {
    setRemovedMediaIds(prev => prev.filter(id => id !== mediaId));
  };

  const handleToggleExistingMedia = (mediaId) => {
    if (removedMediaIds.includes(mediaId)) {
      handleRestoreExistingMedia(mediaId);
    } else {
      handleRemoveExistingMedia(mediaId);
    }
  };

  const handleEdit = async () => {
    if (!description.trim() || submitLoading) return;
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const privacy = visibility === 'contacts' ? 'onlyFriends' : 'public';
      const result = await editPublicationWithMedia({
        id: publication.id,
        description,
        files: newFiles,
        removeMediaIds: removedMediaIds,
        privacy
      });
      if (onEdit) {
        try { onEdit({ success: true, data: result.data }); } catch(e) { /* ignore */ }
      }
      handleClose();
    } catch (error) {
      setSubmitError(error.message || 'Error al actualizar publicación');
      if (onEdit) {
        try { onEdit({ success: false, error: error.message || 'Error al actualizar publicación' }); } catch(e) { /* ignore */ }
      }
      handleClose();
    } finally {
      setSubmitLoading(false);
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

  // Viewer control callbacks must be declared before any conditional returns so hook order stays stable
  const openViewerAt = useCallback((idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  }, []);
  const closeViewer = useCallback(() => setViewerOpen(false), []);
  // Navegación del visor usando combinedMedia ya definido más arriba
  const nextViewer = useCallback(() => {
    if (combinedMedia.length === 0) return;
    setViewerIndex(i => (i + 1) % combinedMedia.length);
  }, [combinedMedia.length]);
  const prevViewer = useCallback(() => {
    if (combinedMedia.length === 0) return;
    setViewerIndex(i => (i - 1 + combinedMedia.length) % combinedMedia.length);
  }, [combinedMedia.length]);

  // Safe early return AFTER all hooks
  if (!open) return null;

  return (
    <>
      <div className={open ? "fixed inset-0 z-50 flex justify-center items-center min-h-screen bg-black/30 backdrop-blur-sm" : "hidden"}>
        <VisibilityModal
          open={showVisibilityModal}
          onClose={() => setShowVisibilityModal(false)}
          value={visibility}
          onChange={(v) => { setVisibility(v); setShowVisibilityModal(false); }}
        />
        <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#e0f0f0]">
            <div className="flex items-center gap-3">
              <img
                src={user?.profilePicture?.startsWith('http')
                  ? user.profilePicture
                  : user?.profilePicture
                    ? `${config.IMAGE_URL}/${user.profilePicture}`
                    : '/images/default-avatar.png'}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-[#c6e3e4] object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-conexia-green text-lg">{user?.displayName || 'Usuario'}</span>
                <button onClick={() => setShowVisibilityModal(true)} className="flex items-center gap-1 text-sm text-conexia-green/70 hover:text-conexia-green transition-colors">
                  {visibility === 'all' ? <FaGlobeAmericas /> : <FaUsers />}
                  <span>{visibility === 'all' ? 'Público' : 'Solo amigos'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
            <button onClick={handleClose} className="text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors">
              <svg width="24" height="24" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 overflow-x-hidden">
            <div className="w-full max-w-xl flex flex-col items-center justify-center">
              <div className="flex flex-col w-full" style={{ alignItems:'center' }}>
                <div className="bg-[#f8fcfc] border border-[#c6e3e4] rounded-t-2xl flex flex-col p-0 relative overflow-y-auto overflow-x-hidden w-full" style={{ minHeight:160, maxHeight:320, margin:0, borderBottom:'none' }}>
                  <div className="flex flex-col gap-2 px-1 pt-3 pb-3 w-full">
                    <textarea
                      ref={textareaRef}
                      className="w-full border-none outline-none bg-transparent resize-none text-conexia-green placeholder:text-conexia-green/50 text-base"
                      placeholder="¿Qué tienes en mente?"
                      maxLength={MAX_DESCRIPTION}
                      value={description}
                      onChange={(e)=>setDescription(e.target.value)}
                      style={{ minHeight:MIN_TEXTAREA_HEIGHT, height:'auto', margin:'8px', overflow:'hidden', resize:'none' }}
                      rows={1}
                    />
                    {/* Grid combinado (2 columnas) de medios existentes + nuevos */}
                    <div className="px-2">
                      <div className="grid grid-cols-2 gap-3">
                        {combinedMedia.map((item, idx) => {
                          if (item.kind === 'existing') {
                            const m = item.media;
                            const mediaUrl = getMediaUrlFromObject(m);
                            const isVideo = (m.fileType || m.mediaType || '').startsWith('video/');
                            return (
                              <div key={`exist-${m.id}`} className="relative group aspect-square w-full bg-[#eef6f6] border border-[#c6e3e4] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openViewerAt(idx)}>
                                {isVideo ? (
                                  <video src={mediaUrl} className="object-cover w-full h-full" muted />
                                ) : (
                                  <img src={mediaUrl} alt={m.filename || 'media'} className="object-cover w-full h-full" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleToggleExistingMedia(m.id); }}
                                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                                >
                                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">{idx + 1}</span>
                              </div>
                            );
                          }
                          const f = item.file;
                          const isVid = f.type.startsWith('video/');
                          return (
                            <div key={`new-${idx}`} className="relative group aspect-square w-full bg-[#eef6f6] border border-[#c6e3e4] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openViewerAt(idx)}>
                              {isVid ? (
                                <video src={URL.createObjectURL(f)} className="object-cover w-full h-full" />
                              ) : (
                                <img src={URL.createObjectURL(f)} alt={`nuevo-${idx}`} className="object-cover w-full h-full" />
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveNewFile(idx - activeExisting.length); }}
                                className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                              </button>
                              <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">{idx + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                      {fileError && <div className="text-red-500 text-xs mt-1">{fileError}</div>}
                      {submitError && <div className="text-red-500 text-xs mt-1">{submitError}</div>}
                    </div>
                  </div>
                </div>
                <div className="w-full border border-[#c6e3e4] border-t-0 bg-[#f8fcfc] rounded-b-2xl" style={{ margin:0 }}>
                  <div className="px-4 pt-2 pb-1"><div className="text-[11px] text-conexia-green/60 leading-snug">{FILES_LEGEND}</div></div>
                  <div className="h-px bg-[#e0f0f0] mx-3" />
                  <div className="flex items-center gap-3 px-3 pt-2 pb-2">
                    <div className="relative">
                      <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e0f0f0] text-conexia-green/60 hover:text-conexia-green" onClick={()=>setShowEmoji(v=>!v)} title="Emoji"><BsEmojiSmile /></button>
                      {showEmoji && (
                        <div className="absolute bottom-full mb-2 left-0 z-50">
                          <div className="relative bg-white rounded-xl shadow-xl border border-[#c6e3e4] overflow-hidden" style={{ width:260, height:260 }}>
                            <Picker
                              onEmojiClick={(emojiData)=>{handleEmojiClick(emojiData); setShowEmoji(false);}}
                              theme="light"
                              height={260}
                              width={260}
                              searchDisabled={false}
                              emojiStyle="native"
                              lazyLoadEmojis={true}
                              skinTonesDisabled={false}
                              previewConfig={{ showPreview:false }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={()=>handleFileIconClick('image')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#e0f0f0]"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><circle cx="8" cy="10" r="2" fill="#1e6e5c"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/></svg></button>
                    <button type="button" onClick={()=>handleFileIconClick('video')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#e0f0f0]"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><polygon points="10,9 16,12 10,15" fill="#1e6e5c"/></svg></button>
                    <button type="button" onClick={()=>handleFileIconClick('gif')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#e0f0f0]"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text></svg></button>
                    <span className="text-xs text-conexia-green/50 ml-auto">{description.length}/{MAX_DESCRIPTION}</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} multiple />
                {/* Picker ahora anclado sobre el botón dentro del contenedor relativo */}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-4 border-t border-[#e0f0f0] bg-[#eef6f6] rounded-b-2xl">
            <Button type="button" variant="cancel" onClick={handleClose} className="!px-4 !py-2 !rounded-lg">Cancelar</Button>
            <Button onClick={handleEdit} disabled={!description.trim() || submitLoading} className="!px-6 !py-2 !rounded-lg">{submitLoading ? 'Actualizando...' : 'Actualizar publicación'}</Button>
          </div>
          {submitError && <div className="text-red-500 text-xs text-center pb-2">{submitError}</div>}
        </div>
      </div>
      {viewerOpen && combinedMedia.length > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={closeViewer}>
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl border border-[#c6e3e4] flex flex-col items-center justify-center p-4 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={closeViewer} className="absolute z-20 top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white text-conexia-green rounded-full shadow-md border border-[#c6e3e4] transition-colors focus:outline-none focus:ring-2 focus:ring-conexia-green/40" aria-label="Cerrar visor">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="w-full h-[70vh] flex items-center justify-center relative select-none bg-[#f8fcfc] rounded-xl border border-[#e0f0f0]">
              {(() => {
                const current = combinedMedia[viewerIndex];
                if (current.kind === 'existing') {
                  const m = current.media;
                  const mediaUrl = getMediaUrlFromObject(m);
                  const type = m.fileType || m.mediaType || '';
                  if (type.startsWith('image/')) return <img src={mediaUrl} alt={m.filename} className="max-h-full max-w-full object-contain" />;
                  if (type.startsWith('video/')) return <video src={mediaUrl} controls autoPlay className="max-h-full max-w-full object-contain" />;
                } else if (current.kind === 'new') {
                  const f = current.file;
                  if (f.type.startsWith('image/')) return <img src={URL.createObjectURL(f)} alt={`preview-${viewerIndex}`} className="max-h-full max-w-full object-contain" />;
                  if (f.type.startsWith('video/')) return <video src={URL.createObjectURL(f)} controls autoPlay className="max-h-full max-w-full object-contain" />;
                }
                return <div className="text-conexia-green">Archivo</div>;
              })()}
              {combinedMedia.length > 1 && (
                <>
                  <button onClick={prevViewer} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center">‹</button>
                  <button onClick={nextViewer} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center">›</button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    {combinedMedia.map((_, i) => (
                      <button key={i} onClick={()=>setViewerIndex(i)} className={`w-3 h-3 rounded-full ${i===viewerIndex ? 'bg-white' : 'bg-white/40'}`} aria-label={`Ir a ${i+1}`} />
                    ))}
                  </div>
                  <div className="absolute top-3 left-4 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">{viewerIndex + 1} / {combinedMedia.length}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

EditPublicationModalMultiple.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  loading: PropTypes.bool,
  publication: PropTypes.object,
  user: PropTypes.object
};