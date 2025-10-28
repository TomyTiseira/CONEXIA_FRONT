'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ChevronDown, Edit2, Trash2, MoreVertical, Flag } from 'lucide-react';
import { getServiceReviews, updateServiceReview, deleteServiceReview, respondToServiceReview } from '@/service/serviceReviews';
import { config } from '@/config';
import ReviewEditModal from './ReviewEditModal';
import ReviewDeleteModal from './ReviewDeleteModal';
import ReviewReportModal from './ReviewReportModal';
import Toast from '@/components/ui/Toast';

export default function AllReviewsModal({ serviceId, isOpen, onClose, initialData, filterRating: initialFilterRating = null, onReviewsChanged }) {
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // summaryData ahora se mantiene estático con los datos iniciales
  const [summaryData, setSummaryData] = useState(initialData);
  const [selectedRating, setSelectedRating] = useState(initialFilterRating);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const observerTarget = useRef(null);
  const filterRef = useRef(null);
  const reviewsPerPage = 10;

  // Estados para editar/eliminar/reportar reseñas
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [hasChanges, setHasChanges] = useState(false); // Flag para detectar cambios
  
  // Estados para respuestas del dueño del servicio (inline)
  const [respondingToReviewId, setRespondingToReviewId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);

  // Estados para expansión de comentarios y respuestas largas
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedResponses, setExpandedResponses] = useState({});

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowRatingFilter(false);
      }
      
      // Cerrar menús de acciones
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Inicializar summaryData con initialData una sola vez
  useEffect(() => {
    if (isOpen && initialData) {
      setSummaryData(initialData);
    }
  }, [isOpen, initialData]);

  // Cargar datos iniciales cuando se abre el modal o cambia el filtro
  useEffect(() => {
    if (isOpen) {
      loadInitialReviews();
    }
  }, [isOpen, selectedRating]);

  const loadInitialReviews = async () => {
    try {
      setLoading(true);
      setPage(1);
      const data = await getServiceReviews(serviceId, 1, reviewsPerPage, selectedRating);
      setReviews(data.reviews || []);
      // NO actualizamos summaryData aquí para mantenerlo estático
      setHasMore(data.reviews.length >= reviewsPerPage);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const data = await getServiceReviews(serviceId, nextPage, reviewsPerPage, selectedRating);
      
      if (data.reviews && data.reviews.length > 0) {
        setReviews(prev => [...prev, ...data.reviews]);
        setPage(nextPage);
        setHasMore(data.reviews.length >= reviewsPerPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more reviews:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreReviews();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page]);

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteReview = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleReportReview = (review) => {
    setSelectedReview(review);
    setShowReportModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmEdit = async (updatedData) => {
    setActionLoading(true);
    try {
      await updateServiceReview(selectedReview.id, updatedData);
      
      // Actualizar la reseña en la lista local del modal
      setReviews(prevReviews => 
        prevReviews.map(r => 
          r.id === selectedReview.id 
            ? { ...r, comment: updatedData.comment }
            : r
        )
      );
      
      setShowEditModal(false);
      setSelectedReview(null);
      setHasChanges(true); // Marcar que hubo cambios
      
      // Mostrar toast de éxito
      setToast({
        type: 'success',
        message: 'Reseña actualizada correctamente',
        isVisible: true
      });
    } catch (err) {
      // Mostrar toast de error
      setToast({
        type: 'error',
        message: err.message || 'Error al actualizar la reseña',
        isVisible: true
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await deleteServiceReview(selectedReview.id);
      
      // Eliminar la reseña de la lista local del modal
      setReviews(prevReviews => prevReviews.filter(r => r.id !== selectedReview.id));
      
      setShowDeleteModal(false);
      setSelectedReview(null);
      setHasChanges(true); // Marcar que hubo cambios
      
      // Mostrar toast de éxito
      setToast({
        type: 'success',
        message: 'Reseña eliminada correctamente',
        isVisible: true
      });
    } catch (err) {
      // Mostrar toast de error
      setToast({
        type: 'error',
        message: err.message || 'Error al eliminar la reseña',
        isVisible: true
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReport = async (reportData) => {
    setActionLoading(true);
    try {
      // TODO: Implementar endpoint de reporte de reseñas cuando esté disponible
      // await reportServiceReview(selectedReview.id, reportData);
      
      console.log('Reporte enviado:', { reviewId: selectedReview.id, ...reportData });
      
      setShowReportModal(false);
      setSelectedReview(null);
      
      // Mostrar toast de éxito
      setToast({
        type: 'success',
        message: 'Reporte enviado correctamente. Será revisado por nuestro equipo.',
        isVisible: true
      });
    } catch (err) {
      // Mostrar toast de error
      setToast({
        type: 'error',
        message: err.message || 'Error al enviar el reporte',
        isVisible: true
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  // Manejar respuesta del dueño del servicio
  const handleRespondToReview = (review) => {
    setRespondingToReviewId(review.id);
    setResponseText(review.ownerResponse || '');
    setOpenMenuId(null);
  };

  const handleCancelResponse = () => {
    setRespondingToReviewId(null);
    setResponseText('');
  };

  const handleConfirmResponse = async (reviewId) => {
    if (!responseText || responseText.trim().length < 10) {
      setToast({
        type: 'error',
        message: 'La respuesta debe tener al menos 10 caracteres',
        isVisible: true
      });
      return;
    }

    if (responseText.length > 500) {
      setToast({
        type: 'error',
        message: 'La respuesta no puede exceder 500 caracteres',
        isVisible: true
      });
      return;
    }

    setResponseLoading(true);
    try {
      await respondToServiceReview(reviewId, responseText.trim());
      
      // Actualizar la reseña en la lista local
      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === reviewId
            ? { ...r, ownerResponse: responseText.trim(), ownerResponseDate: new Date().toISOString() }
            : r
        )
      );
      
      setRespondingToReviewId(null);
      setResponseText('');
      setHasChanges(true);
      
      setToast({
        type: 'success',
        message: 'Respuesta publicada correctamente',
        isVisible: true
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Error al publicar la respuesta',
        isVisible: true
      });
    } finally {
      setResponseLoading(false);
    }
  };

  // Manejar el cierre del modal
  const handleClose = () => {
    // Si hubo cambios, notificar al padre para recargar
    if (hasChanges && onReviewsChanged) {
      onReviewsChanged();
    }
    // Resetear el flag de cambios
    setHasChanges(false);
    // Cerrar el modal
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Obtener primer nombre y primer apellido
  const getFirstNameAndLastName = (user) => {
    const firstName = user?.name?.split(' ')[0] || '';
    const firstLastName = user?.lastName?.split(' ')[0] || '';
    return `${firstName} ${firstLastName}`.trim();
  };

  // Helper para normalizar la URL de la imagen de perfil
  const getProfilePictureUrl = (img) => {
    const defaultAvatar = `${config.DOCUMENT_URL}/files/img/profile/no-photo.jpg`;
    if (!img) return defaultAvatar;
    if (img === defaultAvatar) return defaultAvatar;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads')) return `${config.DOCUMENT_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
    if (img.startsWith('/')) return `${config.DOCUMENT_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
    return `${config.IMAGE_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
  };

  // Helper para verificar si un texto necesita truncamiento (más de 150 caracteres o 3 líneas)
  const needsTruncation = (text) => {
    if (!text) return false;
    const lines = text.split('\n');
    return text.length > 150 || lines.length > 3;
  };

  // Helper para truncar texto a aproximadamente 3 líneas o 150 caracteres
  const truncateText = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n');
    }
    if (text.length > 150) {
      return text.substring(0, 150);
    }
    return text;
  };

  if (!isOpen) return null;

  const { total = 0, averageRating = 0, ratingDistribution = {} } = summaryData || initialData || {};

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Opiniones del servicio
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Cerrar"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Layout estilo Mercado Libre: 2 columnas */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="w-full h-full flex">
            {/* Columna izquierda: Resumen de calificaciones (STICKY - sin scroll) */}
            <div className="hidden md:block w-[300px] flex-shrink-0 p-6 border-r border-gray-200">
              <div className="bg-gradient-to-r from-conexia-green/10 to-green-50 rounded-lg p-6">
                {/* Promedio */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-conexia-green mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Promedio entre {total} {total === 1 ? 'opinión' : 'opiniones'}
                  </div>
                </div>

                {/* Distribución */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-gray-700">{rating}</span>
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{
                            width: `${
                              total > 0
                                ? (ratingDistribution[rating] / total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">
                        {ratingDistribution[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha: Lista de reseñas (CON scroll independiente) */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Filtro de calificaciones */}
              <div className="mb-6 flex items-center gap-2" ref={filterRef}>
                <div className="relative">
                  <button
                    onClick={() => setShowRatingFilter(!showRatingFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    Calificaciones {selectedRating ? `(${selectedRating})` : ''}
                    <ChevronDown size={16} className={`transition-transform ${showRatingFilter ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showRatingFilter && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setSelectedRating(null);
                          setShowRatingFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm border-b ${!selectedRating ? 'bg-blue-50 font-medium' : ''}`}
                      >
                        Todas
                      </button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setSelectedRating(rating);
                            setShowRatingFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center justify-between text-sm ${selectedRating === rating ? 'bg-blue-50 font-medium' : ''}`}
                        >
                          <div className="flex items-center gap-1">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-gray-600">
                            ({ratingDistribution[rating] || 0})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de reseñas */}
              {reviews.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <Star size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No hay reseñas para mostrar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      {/* Header de la reseña */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <img
                            src={getProfilePictureUrl(review.reviewUser?.profilePicture)}
                            alt={getFirstNameAndLastName(review.reviewUser)}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                          />
                          
                          {/* Información del usuario y fecha */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {getFirstNameAndLastName(review.reviewUser)}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Botón de acciones */}
                        <div className="flex-shrink-0 relative" ref={el => menuRefs.current[review.id] = el}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200"
                            title="Más opciones"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>
                          
                          {openMenuId === review.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              {review.isOwner ? (
                                // Opciones para el dueño de la reseña
                                <>
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm border-b"
                                  >
                                    <Edit2 size={16} className="text-conexia-green" />
                                    <span>Editar reseña</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-red-600"
                                  >
                                    <Trash2 size={16} />
                                    <span>Eliminar reseña</span>
                                  </button>
                                </>
                              ) : review.isServiceOwner ? (
                                // Opciones para el dueño del servicio
                                <>
                                  <button
                                    onClick={() => handleRespondToReview(review)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-conexia-green border-b"
                                  >
                                    <Edit2 size={16} />
                                    <span>{review.ownerResponse ? 'Editar respuesta' : 'Responder'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleReportReview(review)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-orange-600"
                                  >
                                    <Flag size={16} />
                                    <span>Reportar reseña</span>
                                  </button>
                                </>
                              ) : (
                                // Opción para reportar (usuarios que no son dueños ni del servicio)
                                <button
                                  onClick={() => handleReportReview(review)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-orange-600"
                                >
                                  <Flag size={16} />
                                  <span>Reportar reseña</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Calificación */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>

                      {/* Comentario */}
                      <div className="text-sm text-gray-700">
                        <p className="whitespace-pre-line">
                          {expandedComments[review.id] || !needsTruncation(review.comment)
                            ? review.comment
                            : truncateText(review.comment)}
                        </p>
                        {needsTruncation(review.comment) && (
                          <button
                            onClick={() => setExpandedComments(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                            className="text-[#367d7d] hover:text-[#2b6a6a] font-medium text-sm mt-1 inline-flex items-center gap-1 transition"
                          >
                            {expandedComments[review.id] ? '' : '...más'}
                          </button>
                        )}
                      </div>

                      {/* Respuesta del dueño del servicio (si existe) */}
                      {review.ownerResponse && review.serviceOwner && respondingToReviewId !== review.id && (
                        <div className="mt-4 ml-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border-l-4 border-conexia-green relative">
                          {/* Menú de editar para el dueño del servicio */}
                          {review.isServiceOwner && (
                            <div className="absolute top-2 right-2" ref={el => menuRefs.current[`response-${review.id}`] = el}>
                              <button
                                onClick={() => setOpenMenuId(openMenuId === `response-${review.id}` ? null : `response-${review.id}`)}
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all duration-200"
                                title="Más opciones"
                              >
                                <MoreVertical size={16} className="text-gray-600" />
                              </button>
                              {openMenuId === `response-${review.id}` && (
                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                  <button
                                    onClick={() => handleRespondToReview(review)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-conexia-green"
                                  >
                                    <Edit2 size={16} />
                                    <span>Editar respuesta</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-start gap-3">
                            <img
                              src={getProfilePictureUrl(review.serviceOwner?.profilePicture)}
                              alt={getFirstNameAndLastName(review.serviceOwner)}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {review.isServiceOwner ? 'Tu respuesta' : `Respuesta de ${getFirstNameAndLastName(review.serviceOwner)}`}
                              </h4>
                              {review.ownerResponseDate && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDate(review.ownerResponseDate)}
                                </p>
                              )}
                              <div className="text-sm text-gray-700">
                                <p className="whitespace-pre-line">
                                  {expandedResponses[review.id] || !needsTruncation(review.ownerResponse)
                                    ? review.ownerResponse
                                    : truncateText(review.ownerResponse)}
                                </p>
                                {needsTruncation(review.ownerResponse) && (
                                  <button
                                    onClick={() => setExpandedResponses(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                                    className="text-[#367d7d] hover:text-[#2b6a6a] font-medium text-sm mt-1 inline-flex items-center gap-1 transition"
                                  >
                                    {expandedResponses[review.id] ? '' : '...más'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Formulario inline para responder (dueño del servicio) */}
                      {respondingToReviewId === review.id && review.isServiceOwner && (
                        <div className="mt-4 ml-6 p-4 bg-gradient-to-r from-conexia-green/5 to-green-50/50 rounded-lg border-l-4 border-conexia-green">
                          <div className="flex items-start gap-3">
                            <img
                              src={getProfilePictureUrl(review.serviceOwner?.profilePicture)}
                              alt="Tu foto"
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-conexia-green/30"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-conexia-green mb-2">
                                Tu respuesta
                              </h4>
                              <div className="relative">
                                <textarea
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Escribe tu respuesta a esta reseña... (Mínimo 10 caracteres)"
                                  className="w-full px-3 py-2 pb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green/50 focus:border-conexia-green text-sm resize-none"
                                  rows={3}
                                  maxLength={500}
                                  disabled={responseLoading}
                                />
                                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                                  {responseText.length}/500
                                </span>
                              </div>
                              <div className="flex justify-end gap-2 mt-3">
                                <button
                                  onClick={handleCancelResponse}
                                  disabled={responseLoading}
                                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleConfirmResponse(review.id)}
                                  disabled={responseLoading || !responseText.trim() || responseText.trim().length < 10}
                                  className="px-4 py-1.5 text-sm bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {responseLoading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                      <span>Guardando...</span>
                                    </>
                                  ) : (
                                    <span>{review.ownerResponse ? 'Actualizar' : 'Publicar'}</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator para scroll infinito */}
                  {loading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
                    </div>
                  )}

                  {/* Observador para scroll infinito */}
                  <div ref={observerTarget} className="h-4"></div>

                  {/* Mensaje de fin */}
                  {!hasMore && reviews.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Has visto todas las reseñas
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ReviewEditModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmEdit}
        review={selectedReview}
        loading={actionLoading}
      />

      <ReviewDeleteModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />

      <ReviewReportModal
        open={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmReport}
        loading={actionLoading}
      />

      {/* Toast con z-index superior al modal */}
      {toast && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100000, pointerEvents: 'none', display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <Toast
              type={toast.type}
              message={toast.message}
              isVisible={toast.isVisible}
              onClose={handleCloseToast}
              duration={3000}
              position="top-center"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Usar portal para renderizar el modal fuera del árbol DOM normal
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
}
