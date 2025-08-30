import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { config } from '@/config';
import { MoreVertical, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import DeletePublicationModal from './DeletePublicationModal';
import EditPublicationModal from './EditPublicationModal';
import { deletePublication } from '@/service/publications/deletePublication';
import { editPublication } from '@/service/publications/editPublication';

const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
  if (mediaUrl.startsWith('/uploads')) return `${config.IMAGE_URL}${mediaUrl.replace('/uploads', '')}`;
  if (mediaUrl.startsWith('/')) return `${config.IMAGE_URL}${mediaUrl}`;
  return `${config.IMAGE_URL}/${mediaUrl}`;
};


export default function PublicationCard({ publication }) {
  const { user } = useAuth();
  const { profile } = useUserStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = user && publication.userId && String(user.id) === String(publication.userId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const handleEdit = async ({ description, file, privacy }) => {
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      // Solo enviar media si hay archivo nuevo
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
      // Opcional: refrescar publicaciones (emitir evento, callback, o recargar)
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error al eliminar publicación');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Avatar y nombre igual que en ClientCommunity
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';
  const displayName = profile?.name && profile?.lastName ? `${profile.name} ${profile.lastName}` : 'Usuario';

  return (
    <div className="bg-[#f8fcfc] rounded-xl shadow-sm p-4 border border-[#c6e3e4] flex flex-col relative">
      {/* Three dots menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          className="p-1 rounded-full hover:bg-[#e0f0f0] focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreVertical size={20} className="text-conexia-green" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 min-w-[240px] bg-white border border-[#c6e3e4] rounded-lg shadow-lg py-1 flex flex-col animate-fade-in z-20">
            {!isOwner && (
              <button
                className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                onClick={() => { setMenuOpen(false); /* TODO: abrir modal reportar */ }}
                style={{maxWidth: 'none'}}
              >
                <span className="flex-shrink-0 flex items-center justify-center"><AlertCircle size={22} strokeWidth={2} className="text-conexia-green" /></span>
                <span>Reportar publicación</span>
              </button>
            )}
            {isOwner && (
              <>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => { setMenuOpen(false); setShowEditModal(true); }}
                  style={{maxWidth: 'none'}}
                >
                  <Pencil size={22} className="" />
                  <span>Editar publicación</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-[#fff0f0] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                  style={{maxWidth: 'none'}}
                >
                  <Trash2 size={22} className="" />
                  <span>Eliminar publicación</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <DeletePublicationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        loading={deleteLoading}
      />
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
          profilePicture: profile?.profilePicture,
          name: profile?.name,
          lastName: profile?.lastName,
          profession: profile?.profession,
          location: profile?.location,
        }}
      />
      <div className="text-conexia-green font-semibold mb-2">{publication.description}</div>
      {publication.mediaUrl && publication.mediaType === 'image' && (
        <img src={getMediaUrl(publication.mediaUrl)} alt="media" className="rounded-lg max-h-60 object-contain my-2 mx-auto" />
      )}
      {publication.mediaUrl && publication.mediaType === 'video' && (
        <video controls className="rounded-lg max-h-60 object-contain my-2 mx-auto">
          <source src={getMediaUrl(publication.mediaUrl)} />
          Tu navegador no soporta video.
        </video>
      )}
      {publication.mediaUrl && publication.mediaType === 'gif' && (
        <img src={getMediaUrl(publication.mediaUrl)} alt="media gif" className="rounded-lg max-h-60 object-contain my-2 mx-auto" />
      )}
      <div className="text-xs text-gray-500 mt-2">{new Date(publication.createdAt).toLocaleString()}</div>
    </div>
  );
}

PublicationCard.propTypes = {
  publication: PropTypes.object.isRequired
};