"use client";
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import { BsEmojiSmile } from 'react-icons/bs';
import MediaPreview from '@/components/ui/MediaPreview';
import ExistingMediaPreview from '@/components/ui/ExistingMediaPreview';
import { editPublicationWithMedia } from '@/service/publications/editPublication';
import { config } from '@/config';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILES = 5;
const MAX_VIDEOS = 1;
const FILES_LEGEND = 'Hasta 5 archivos, solo 1 video por publicación. Formatos permitidos: JPG, PNG, GIF, MP4.';

// Modal de éxito

// Modal de éxito
function SuccessModal({ open }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
      <div className="bg-white border border-[#c6e3e4] rounded-2xl shadow-2xl flex flex-col items-center px-8 py-8 animate-fadeIn">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-conexia-green/10 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#e0f0f0"/>
            <path d="M7 13.5l3 3 7-7" stroke="#1e6e5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-conexia-green text-lg font-semibold mb-2">Publicación actualizada con éxito</div>
      </div>
    </div>
  );
}

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
  const [showSuccess, setShowSuccess] = useState(false);
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
  
  const fileInputRef = useRef();
  const textareaRef = useRef();

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (open && publication) {
      setDescription(publication.description || '');
      setExistingMedia(publication.media || []);
      setRemovedMediaIds([]);
      setNewFiles([]);
      setFileError('');
      setSubmitError('');
      
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
      
      if (onEdit) onEdit(result.data);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 1500);
      
    } catch (error) {
      setSubmitError(error.message || 'Error al actualizar publicación');
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

  if (!open && !showSuccess) return null;

  return (
    <>
      <SuccessModal open={showSuccess} />
      
      <div className={open ? "fixed inset-0 z-50 flex justify-center items-center min-h-screen bg-black/30 backdrop-blur-sm" : "hidden"}>
        <VisibilityModal
          open={showVisibilityModal}
          onClose={() => setShowVisibilityModal(false)}
          value={visibility}
          onChange={(v) => {
            setVisibility(v);
            setShowVisibilityModal(false);
          }}
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
                    : '/images/default-avatar.png'
                }
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-[#c6e3e4] object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-conexia-green text-lg">
                  {user?.displayName || 'Usuario'}
                </span>
                <button
                  onClick={() => setShowVisibilityModal(true)}
                  className="flex items-center gap-1 text-sm text-conexia-green/70 hover:text-conexia-green transition-colors"
                >
                  {visibility === 'all' ? <FaGlobeAmericas /> : <FaUsers />}
                  <span>{visibility === 'all' ? 'Público' : 'Solo amigos'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <button onClick={handleClose} className="text-conexia-green hover:bg-[#e0f0f0] rounded-full p-2 transition-colors">
              <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 overflow-hidden">
            <div className="w-full max-w-xl flex flex-col items-center justify-center">
              <div className="flex flex-col w-full">
                <div className="bg-[#f8fcfc] border border-[#c6e3e4] rounded-t-2xl flex flex-col p-0 relative overflow-y-auto w-full" style={{ minHeight: 160, maxHeight: 300, borderBottom: 'none' }}>
                  <div className="flex flex-col gap-2 px-1 pt-3 pb-3 w-full overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      className="w-full border-none outline-none bg-transparent resize-none text-conexia-green placeholder:text-conexia-green/50 text-base"
                      placeholder="¿Qué tienes en mente?"
                      maxLength={MAX_DESCRIPTION}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ minHeight: 38, height: 'auto', margin: '8px', overflow: 'hidden', resize: 'none' }}
                      rows={3}
                    />
                    
                    {/* Medios existentes */}
                    {existingMedia.length > 0 && (
                      <div className="px-2 w-full overflow-hidden">
                        <h4 className="text-sm font-medium text-conexia-green mb-2">Archivos actuales:</h4>
                        <ExistingMediaPreview 
                          media={existingMedia}
                          removedIds={removedMediaIds}
                          onToggleRemove={handleToggleExistingMedia}
                        />
                      </div>
                    )}
                    
                    {/* Nuevos archivos */}
                    <div className="px-2 w-full overflow-hidden">
                      {newFiles.length > 0 && (
                        <h4 className="text-sm font-medium text-conexia-green mb-2">Nuevos archivos:</h4>
                      )}
                      <MediaPreview 
                        files={newFiles} 
                        onRemove={handleRemoveNewFile}
                        maxFiles={MAX_FILES}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Controles */}
                <div className="flex items-center gap-3 px-3 py-2 border border-[#c6e3e4] border-t-0 bg-[#f8fcfc] rounded-b-2xl w-full" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e0f0f0] text-conexia-green/60 hover:text-conexia-green"
                    onClick={() => setShowEmoji(v => !v)}
                    title="Emoji"
                  >
                    <BsEmojiSmile />
                  </button>
                  <button type="button" onClick={() => handleFileIconClick('image')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none hover:bg-[#e0f0f0]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/>
                      <circle cx="8" cy="10" r="2" fill="#1e6e5c"/>
                      <path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleFileIconClick('video')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none hover:bg-[#e0f0f0]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/>
                      <polygon points="10,9 16,12 10,15" fill="#1e6e5c"/>
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleFileIconClick('gif')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none hover:bg-[#e0f0f0]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/>
                      <text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text>
                    </svg>
                  </button>
                  <span className="text-xs text-conexia-green/50 ml-auto">{description.length}/{MAX_DESCRIPTION}</span>
                </div>
                
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} multiple />
                
                {fileError && <div className="text-red-500 text-xs mt-2 px-2">{fileError}</div>}
                {submitError && <div className="text-red-500 text-xs mt-2 px-2">{submitError}</div>}

                {showEmoji && (
                  <div className="absolute bottom-20 left-6 z-50">
                    <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
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

          {/* Footer */}
          <div className="flex flex-col items-end gap-2 p-4 border-t border-[#e0f0f0] bg-[#eef6f6] rounded-b-2xl">
            <div className="w-full text-xs text-conexia-green/60 mb-2 text-left">{FILES_LEGEND}</div>
            <div className="flex items-center justify-end gap-2 w-full">
              <Button type="button" variant="cancel" onClick={handleClose} className="!px-4 !py-2 !rounded-lg">
                Cancelar
              </Button>
              <Button
                onClick={handleEdit}
                disabled={!description.trim() || submitLoading}
                className="!px-4 !py-2 !rounded-lg bg-conexia-green hover:bg-[#0d5951] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? 'Actualizando...' : 'Actualizar publicación'}
              </Button>
            </div>
          </div>
        </div>
      </div>
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