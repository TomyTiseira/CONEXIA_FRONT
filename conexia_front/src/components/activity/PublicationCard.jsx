import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { config } from '@/config';
import { MoreVertical, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { FaGlobeAmericas, FaUsers, FaThumbsUp, FaCommentAlt, FaRegHandPaper, FaHeart, FaRegLightbulb, FaLaughBeam, FaHandsHelping } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import DeletePublicationModal from './DeletePublicationModal';
import EditPublicationModal from './EditPublicationModal';
import { deletePublication } from '@/service/publications/deletePublication';
import { editPublication } from '@/service/publications/editPublication';
import { ROLES } from '@/constants/roles';

const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
  if (mediaUrl.startsWith('/uploads')) return `${config.IMAGE_URL}${mediaUrl.replace('/uploads', '')}`;
  if (mediaUrl.startsWith('/')) return `${config.IMAGE_URL}${mediaUrl}`;
  return `${config.IMAGE_URL}/${mediaUrl}`;
};



function PublicationCard({ publication }) {
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();
  // Estados para menú y modales
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const menuRef = React.useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Avatar, nombre, profesión y privacidad desde publication.owner
  const avatar = publication.owner?.profilePicture
    ? (publication.owner.profilePicture.startsWith('http')
        ? publication.owner.profilePicture
        : `${config.IMAGE_URL}${publication.owner.profilePicture.startsWith('/') ? '' : '/'}${publication.owner.profilePicture}`)
    : '/images/default-avatar.png';
  const ownerId = publication.owner?.id;
  const displayName = publication.owner?.name && publication.owner?.lastName ? `${publication.owner.name} ${publication.owner.lastName}` : publication.owner?.name || 'Usuario';
  const profession = publication.owner?.profession || '';

  // Fecha relativa o absoluta
  function getRelativeOrAbsoluteDate(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays >= 1) {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    } else if (diffHrs >= 1) {
      return `hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
    } else if (diffMin >= 1) {
      return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return 'hace unos segundos';
    }
  }

  // Icono de privacidad (igual que en crear publicación)
  let privacyIcon = null;
  if (publication.privacy === 'public') {
    privacyIcon = <FaGlobeAmericas size={16} className="inline text-conexia-green ml-1 align-text-bottom" title="Público" />;
  } else if (publication.privacy === 'onlyFriends' || publication.privacy === 'contacts') {
    privacyIcon = <FaUsers size={16} className="inline text-conexia-green ml-1 align-text-bottom" title="Solo amigos" />;
  }

  // Lógica de edición y borrado
  const isOwner = user && publication.userId && String(user.id) === String(publication.userId);

  // Lógica de menú: admin/moderador solo ve "Ver reportes", usuario general ve "Reportar publicación", dueño ve editar/eliminar
  const isAdmin = roleName === ROLES.ADMIN;
  const isModerator = roleName === ROLES.MODERATOR;

  const handleEdit = async ({ description, file, privacy }) => {
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      if (file) {
        formData.append('media', file);
      }
      if (privacy) formData.append('privacy', privacy);
      await editPublication(publication.id, formData);
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error al editar publicación');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePublication(publication.id);
      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error al eliminar publicación');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
  <div className="bg-white rounded-2xl shadow border border-[#c6e3e4] flex flex-col relative w-full max-w-2xl mx-auto mb-2 box-border transition-shadow hover:shadow-xl" style={{ minWidth: 0 }}>
      {/* Header autor y menú */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-2 relative min-h-0">
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-[#c6e3e4] object-cover bg-white cursor-pointer"
          onClick={() => ownerId && router.push(`/profile/userProfile/${ownerId}`)}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-conexia-green font-semibold text-base truncate max-w-xs flex items-center gap-1 leading-tight cursor-pointer transition-colors hover:text-[#367d7d] px-1 rounded"
            style={{lineHeight:'1.1'}}
            onClick={() => ownerId && router.push(`/profile/userProfile/${ownerId}`)}
          >
            {displayName}
            {/* LinkedIn badge, opcional: <span className=\"ml-1 bg-[#e0f0f0] text-[#1e6e5c] text-xs px-1.5 py-0.5 rounded font-bold\">in</span> */}
          </span>
          {profession && (
            <span className="text-xs text-conexia-green/80 truncate max-w-xs leading-tight mt-0.5" style={{lineHeight:'1.1'}}>{profession}</span>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5" style={{lineHeight:'1.1'}}>
            {getRelativeOrAbsoluteDate(publication.createdAt)}
            <span className="mx-1 text-[18px] font-bold leading-none text-conexia-green">·</span>
            {privacyIcon}
          </span>
        </div>
        <div className="ml-auto relative">
          <button className="p-1 rounded-full hover:bg-[#e0f0f0] focus:outline-none" onClick={() => setMenuOpen((v) => !v)}>
            <MoreVertical size={22} className="text-conexia-green" />
          </button>
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 min-w-[220px] bg-white border border-[#c6e3e4] rounded-lg shadow-lg py-1 flex flex-col animate-fade-in z-20">
              {/* Admin o moderador: solo ver reportes */}
              {(isAdmin || isModerator) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/reports/publication/${publication.id}`);
                  }}
                  style={{maxWidth: 'none'}}>
                  <span className="flex-shrink-0 flex items-center justify-center"><AlertCircle size={22} strokeWidth={2} className="text-conexia-green" /></span>
                  <span>Ver reportes</span>
                </button>
              )}
              {/* Usuario general (no admin/moderador/owner): reportar */}
              {!isAdmin && !isModerator && !isOwner && (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => { setMenuOpen(false); /* TODO: abrir modal reportar */ }}
                  style={{maxWidth: 'none'}}>
                  <span className="flex-shrink-0 flex items-center justify-center"><AlertCircle size={22} strokeWidth={2} className="text-conexia-green" /></span>
                  <span>Reportar publicación</span>
                </button>
              )}
              {/* Dueño: editar y eliminar */}
              {isOwner && (
                <div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                    onClick={() => { setMenuOpen(false); setShowEditModal(true); }}
                    style={{maxWidth: 'none'}}>
                    <Pencil size={22} className="" />
                    <span>Editar publicación</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-[#fff0f0] text-base font-semibold w-full whitespace-nowrap"
                    onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                    style={{maxWidth: 'none'}}>
                    <Trash2 size={22} className="" />
                    <span>Eliminar publicación</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal edición */}
      <EditPublicationModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleEdit}
        loading={editLoading}
        initialDescription={publication.description}
        initialMediaUrl={publication.mediaUrl ? getMediaUrl(publication.mediaUrl) : ''}
        initialMediaType={publication.mediaType}
        initialPrivacy={publication.privacy}
        user={{
          profilePicture: publication.owner?.profilePicture || '/images/default-avatar.png',
          displayName: publication.owner?.name && publication.owner?.lastName ? `${publication.owner.name} ${publication.owner.lastName}` : publication.owner?.name || 'Usuario',
        }}
      />
      {/* Línea divisoria entre header y contenido */}
      <div className="border-t border-[#e0f0f0] mx-6" />
      {/* Contenido publicación con truncado y ver más */}
      <div className="px-0 pt-4 pb-1 w-full">
        <DescriptionWithReadMore description={publication.description} />
        {publication.mediaUrl && publication.mediaType === 'image' && (
          <img 
            src={getMediaUrl(publication.mediaUrl)} 
            alt="media" 
            className="w-full h-auto my-2 object-contain" 
            style={{display:'block'}} 
          />
        )}
        {publication.mediaUrl && publication.mediaType === 'video' && (
          <video 
            controls 
            className="w-full h-auto my-2 object-contain" 
            style={{display:'block'}}
          >
            <source src={getMediaUrl(publication.mediaUrl)} />
            Tu navegador no soporta video.
          </video>
        )}
        {publication.mediaUrl && publication.mediaType === 'gif' && (
          <img 
            src={getMediaUrl(publication.mediaUrl)} 
            alt="media gif" 
            className="w-full h-auto my-2 object-contain" 
            style={{display:'block'}} 
          />
        )}
      </div>
      {/* Espacio para recuento de reacciones y comentarios */}
      <div className="flex flex-col items-center w-full px-6 pt-2 pb-1">
        {/* Aquí se mostraría el recuento de reacciones y comentarios */}
        <div className="flex items-center justify-between w-full text-sm text-gray-500 mb-1">
          <div className="flex items-center gap-0">
            {/* Reacciones superpuestas, estilo Facebook/LinkedIn */}
            <span className="text-lg -mr-2 z-10 bg-white rounded-full">👍</span>
            <span className="text-lg -mr-2 z-9 bg-white rounded-full">🎉</span>
            <span className="text-lg -mr-2 z-8 bg-white rounded-full">🤝</span>
            <span className="text-lg -mr-2 z-7 bg-white rounded-full">❤️</span>
            <span className="text-lg -mr-2 z-6 bg-white rounded-full">💡</span>
            <span className="text-lg z-5 bg-white rounded-full">😂</span>
            <span className="ml-1">5889</span>
          </div>
          <div>
            61 comentarios
          </div>
        </div>
      </div>
      {/* Línea divisoria */}
      <div className="border-t border-[#e0f0f0] mx-6" />
      {/* Acciones: Reaccionar y Comentar (cada uno ocupa la mitad y centrados en su mitad) */}
      <div className="flex w-full px-6 py-2">
        {/* Mitad izquierda: Reaccionar */}
        <div className="w-1/2 flex justify-center">
          <div className="relative group">
            <button
              className="flex items-center gap-2 text-conexia-green font-semibold py-1 px-4 rounded hover:bg-[#e0f0f0] transition-colors focus:outline-none"
              type="button"
            >
              <span className="text-xl">👍</span>
              Reaccionar
            </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex bg-white rounded-full shadow-lg px-3 py-2 z-30 border border-[#e0f0f0] gap-2 animate-fade-in">
                {/* Me gusta */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">👍</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Recomendar</span>
                </div>
                {/* Celebrar */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">🎉</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Celebrar</span>
                </div>
                {/* Apoyar */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">🤝</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Apoyar</span>
                </div>
                {/* Me encanta */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">❤️</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Encanta</span>
                </div>
                {/* Me interesa */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">💡</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Interesa</span>
                </div>
                {/* Me divierte */}
                <div className="relative flex flex-col items-center">
                  <button className="hover:scale-110 transition-transform" type="button"
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.remove('hidden')}
                    onMouseLeave={e => e.currentTarget.parentElement.querySelector('.tooltip').classList.add('hidden')}
                  >
                    <span className="text-[26px]">😂</span>
                  </button>
                  <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">Divierte</span>
                </div>
              </div>
          </div>
        </div>
        {/* Mitad derecha: Comentar */}
        <div className="w-1/2 flex justify-center">
          <button
            className="flex items-center gap-2 text-conexia-green font-semibold py-1 px-4 rounded hover:bg-[#e0f0f0] transition-colors focus:outline-none"
            type="button"
          >
            <span className="text-xl">💬</span>
            Comentar
          </button>
        </div>
      </div>
      <DeletePublicationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}


PublicationCard.propTypes = {
  publication: PropTypes.object.isRequired
};

// Componente auxiliar para truncar descripción y mostrar 'ver más'

// Truncado visual por líneas usando CSS line-clamp
function DescriptionWithReadMore({ description }) {
  const [expanded, setExpanded] = React.useState(false);
  const [showButton, setShowButton] = React.useState(false);
  const textRef = React.useRef(null);

  React.useEffect(() => {
    if (!expanded && textRef.current) {
      // Detecta si el texto está truncado visualmente
      setShowButton(textRef.current.scrollHeight > textRef.current.clientHeight + 2);
    } else {
      setShowButton(false);
    }
  }, [expanded, description]);

  return (
    <div className="relative">
      <div
        ref={textRef}
        className={
          expanded
            ? "text-conexia-green font-normal mb-2 whitespace-pre-line break-words leading-relaxed text-[1.08rem] px-6 sm:px-8 md:px-10"
            : "text-conexia-green font-normal mb-2 whitespace-pre-line break-words leading-relaxed text-[1.08rem] px-6 sm:px-8 md:px-10 line-clamp-2"
        }
        style={!expanded ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
      >
        {description}
      </div>
      {!expanded && showButton && (
        <button
          className="text-conexia-green font-semibold hover:underline focus:outline-none ml-1 absolute bottom-0 right-8 bg-white pr-2"
          style={{fontSize:'1rem'}}
          onClick={() => setExpanded(true)}
          type="button"
        >
          ...más
        </button>
      )}
    </div>
  );
}

DescriptionWithReadMore.propTypes = {
  description: PropTypes.string.isRequired,
};

export default PublicationCard;