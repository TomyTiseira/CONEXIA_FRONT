'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, ChevronRight, ChevronDown, Edit2, Trash2, MoreVertical, Flag, AlertCircle } from 'lucide-react';
import { getServiceReviews, updateServiceReview, deleteServiceReview, respondToServiceReview, deleteServiceReviewResponse, reportServiceReview, getServiceReviewById } from '@/service/serviceReviews';
import { config } from '@/config';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import AllReviewsModal from './AllReviewsModal';
import ReviewDeleteModal from './ReviewDeleteModal';
import ReviewReportModal from './ReviewReportModal';
import ResponseDeleteModal from './ResponseDeleteModal';
import Toast from '@/components/ui/Toast';

export default function ServiceReviewsSection({ serviceId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roleName } = useUserStore();
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const filterRef = useRef(null);
  
  // Detectar si venimos desde reportes para resaltar una reseña
  const highlightReviewId = searchParams?.get('highlightReviewId');
  const fromReports = searchParams?.get('from') === 'reports-service-review';
  
  // Estado para la reseña reportada cargada específicamente
  const [highlightedReview, setHighlightedReview] = useState(null);
  const [loadingHighlightedReview, setLoadingHighlightedReview] = useState(false);

  // Estados para editar/eliminar reseñas
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResponseDeleteModal, setShowResponseDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  // Estados para edición inline de reseñas
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(0);
  const [editLoading, setEditLoading] = useState(false);

  // Estados para respuestas del dueño del servicio (inline)
  const [respondingToReviewId, setRespondingToReviewId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);

  // Estados para expandir comentarios largos
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedResponses, setExpandedResponses] = useState({});

  // Ref para hacer scroll a la sección de reseñas
  const reviewsSectionRef = useRef(null);
  const highlightedReviewRef = useRef(null);

  useEffect(() => {
    loadReviews();
  }, [serviceId]);
  
  // Cargar reseña reportada específica si venimos desde reportes
  useEffect(() => {
    if (highlightReviewId && fromReports) {
      loadHighlightedReview();
    }
  }, [highlightReviewId, fromReports]);

  // Hacer scroll automático a la reseña reportada cuando se carga
  useEffect(() => {
    if (highlightedReview && highlightedReviewRef.current && fromReports) {
      // Pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => {
        highlightedReviewRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' // Centra la reseña en la pantalla
        });
      }, 300);
    }
  }, [highlightedReview, fromReports]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowRatingFilter(false);
      }

      // Cerrar menú de acciones si se hace click fuera
      if (openMenuId !== null) {
        const menuRef = menuRefs.current[openMenuId];
        if (menuRef && !menuRef.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceReviews(serviceId, 1, 5);
      // Adaptar la respuesta a la estructura antigua para compatibilidad
      const adaptedData = {
        reviews: data.reviews,
        total: data.pagination?.total || 0,
        averageRating: data.averageRating,
        ratingDistribution: data.ratingDistribution,
        pagination: data.pagination
      };
      setReviewsData(adaptedData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHighlightedReview = async () => {
    try {
      setLoadingHighlightedReview(true);
      const review = await getServiceReviewById(parseInt(highlightReviewId));
      setHighlightedReview(review);
    } catch (err) {
      console.error('Error loading highlighted review:', err);
      setToast({
        type: 'error',
        message: 'No se pudo cargar la reseña reportada'
      });
    } finally {
      setLoadingHighlightedReview(false);
    }
  };

  const handleRatingFilterClick = (rating) => {
    setSelectedRating(rating);
    setShowRatingFilter(false);
    setShowAllReviewsModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditingComment(review.comment);
    setEditingRating(review.rating);
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingComment('');
    setEditingRating(0);
  };

  const handleConfirmEdit = async (reviewId) => {
    if (!editingComment || editingComment.trim().length < 10) {
      setToast({
        type: 'error',
        message: 'El comentario debe tener al menos 10 caracteres',
        isVisible: true
      });
      return;
    }

    if (editingComment.length > 500) {
      setToast({
        type: 'error',
        message: 'El comentario no puede exceder 500 caracteres',
        isVisible: true
      });
      return;
    }

    setEditLoading(true);
    try {
      // Solo enviamos el comentario, el rating no se puede editar
      await updateServiceReview(reviewId, {
        comment: editingComment.trim()
      });

      setEditingReviewId(null);
      setEditingComment('');
      setEditingRating(0);

      // Recargar reseñas
      await loadReviews();

      setToast({
        type: 'success',
        message: 'Reseña actualizada exitosamente',
        isVisible: true
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Error al actualizar la reseña',
        isVisible: true
      });
    } finally {
      setEditLoading(false);
    }
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

  const handleViewReports = (review) => {
    setOpenMenuId(null);
    router.push(`/reports/service-review/${review.id}?filter=service-reviews&order=reportCount&page=1`);
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await deleteServiceReview(selectedReview.id);
      setToast({
        type: 'success',
        message: 'Reseña eliminada exitosamente',
        isVisible: true
      });
      setShowDeleteModal(false);
      setSelectedReview(null);
      // Recargar reseñas
      await loadReviews();
    } catch (err) {
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
      // Llamar al endpoint de reporte de reseñas
      await reportServiceReview({
        serviceReviewId: selectedReview.id,
        ...reportData
      });

      setShowReportModal(false);
      setSelectedReview(null);
      setToast({
        type: 'success',
        message: 'Reseña reportada exitosamente',
        isVisible: true
      });
    } catch (err) {
      setShowReportModal(false);
      setSelectedReview(null);
      
      // Verificar si es un error de "ya reportado"
      const errorMessage = err.message || 'Error al enviar el reporte';
      const isAlreadyReported = errorMessage.toLowerCase().includes('already reported') || 
                                errorMessage.toLowerCase().includes('ya has reportado');
      
      setToast({
        type: isAlreadyReported ? 'warning' : 'error',
        message: isAlreadyReported 
          ? 'Ya has reportado esta reseña anteriormente' 
          : errorMessage,
        isVisible: true
      });
    } finally {
      setActionLoading(false);
    }
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

      setRespondingToReviewId(null);
      setResponseText('');

      // Recargar reseñas
      await loadReviews();

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

  const handleCloseToast = () => {
    setToast(null);
  };

  // Manejar eliminación de respuesta del dueño del servicio
  const handleDeleteResponse = (review) => {
    setSelectedReview(review);
    setShowResponseDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmDeleteResponse = async () => {
    setActionLoading(true);
    try {
      await deleteServiceReviewResponse(selectedReview.id);

      setShowResponseDeleteModal(false);
      setSelectedReview(null);

      // Recargar reseñas
      await loadReviews();

      setToast({
        type: 'success',
        message: 'Respuesta eliminada correctamente',
        isVisible: true
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Error al eliminar la respuesta',
        isVisible: true
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas del Servicio</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas del Servicio</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error al cargar las reseñas</p>
        </div>
      </>
    );
  }

  if (!reviewsData || reviewsData.total === 0) {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas del Servicio</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Star size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aún no hay reseñas para este servicio</p>
          <p className="text-sm text-gray-400 mt-2">Sé el primero en dejar tu opinión</p>
        </div>
      </>
    );
  }

  const { reviews, total, averageRating, ratingDistribution } = reviewsData;

  // Verificar si el usuario puede reportar (no puede si es admin o moderador)
  const canReport = roleName === ROLES.USER;
  
  // Verificar si el usuario puede ver la reseña reportada (solo ADMIN o MODERATOR)
  const canViewReportedReview = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
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
    if (img.startsWith('/uploads')) return `${config.DOCUMENT_URL.replace(/\/+$/, '')}/${img.replace(/^\/+/, '')}`;
    if (img.startsWith('/')) return `${config.DOCUMENT_URL.replace(/\/+$/, '')}/${img.replace(/^\/+/, '')}`;
    return `${config.IMAGE_URL.replace(/\/+$/, '')}/${img.replace(/^\/+/, '')}`;
  };

  // Verificar si el texto necesita truncado (más de 3 líneas aprox)
  const needsTruncation = (text) => {
    if (!text) return false;
    const lines = text.split('\n');
    if (lines.length > 3) return true;
    // Aproximadamente 150 caracteres = 3 líneas
    return text.length > 150;
  };

  // Truncar texto a aproximadamente 3 líneas
  const truncateText = (text) => {
    if (!text) return '';
    const lines = text.split('\n').slice(0, 3);
    let truncated = lines.join('\n');
    if (truncated.length > 150) {
      truncated = truncated.substring(0, 150);
    }
    return truncated;
  };

  return (
    <>
      {/* Título principal */}
      <div ref={reviewsSectionRef}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas del Servicio</h2>
      </div>

      {/* Reseña reportada destacada (solo si venimos desde reportes Y es ADMIN/MODERATOR) */}
      {highlightedReview && fromReports && canViewReportedReview && (
        <div 
          ref={highlightedReviewRef}
          className="mb-6 border-2 border-red-500 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 shadow-md overflow-hidden"
        >
          {/* Header de reseña reportada */}
          <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
            <Flag className="text-white" size={18} />
            <span className="text-white font-bold text-sm">RESEÑA REPORTADA</span>
          </div>

          {/* Contenido de la reseña */}
          <div className="p-6">
            {/* Header de la reseña */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <img
                  src={getProfilePictureUrl(highlightedReview.reviewUser?.profilePicture)}
                  alt={getFirstNameAndLastName(highlightedReview.reviewUser)}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                />

                {/* Información del usuario y fecha */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {getFirstNameAndLastName(highlightedReview.reviewUser)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(highlightedReview.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Calificación */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={
                    star <= highlightedReview.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>

            {/* Comentario */}
            {highlightedReview.comment && (
              <p className="text-sm text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap break-words">
                {highlightedReview.comment}
              </p>
            )}

            {/* Respuesta del dueño (si existe) */}
            {highlightedReview.ownerResponse && (
              <div className="mt-4 pl-4 border-l-4 border-conexia-green/40 bg-white/80 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={getProfilePictureUrl(highlightedReview.serviceOwner?.profilePicture)}
                    alt={getFirstNameAndLastName(highlightedReview.serviceOwner)}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-conexia-green"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-conexia-green truncate">
                      Respuesta del proveedor - {getFirstNameAndLastName(highlightedReview.serviceOwner)}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {highlightedReview.ownerResponseDate ? formatDate(highlightedReview.ownerResponseDate) : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {highlightedReview.ownerResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen de calificaciones */}
      <div className="bg-gradient-to-r from-conexia-green/10 to-green-50 rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Promedio */}
          <div className="text-center md:border-r md:border-gray-300 md:pr-6">
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
              {total} {total === 1 ? 'reseña' : 'reseñas'}
            </div>
          </div>

          {/* Distribución */}
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-700 w-3">{rating}</span>
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{
                      width: `${total > 0
                          ? (ratingDistribution[rating] / total) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtro de calificaciones - estilo dropdown */}
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
                  setShowAllReviewsModal(true);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm border-b ${!selectedRating ? 'bg-blue-50 font-medium' : ''}`}
              >
                Todas
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilterClick(rating)}
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
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            {/* Wrapper para la reseña del cliente con highlight condicional */}
            <div
              className={`transition-all duration-200 ${editingReviewId === review.id
                  ? 'bg-gradient-to-r from-[#367d7d]/5 to-[#367d7d]/10 -mx-4 px-4 py-4 rounded-lg border-l-4 border-[#367d7d] shadow-sm'
                  : ''
                }`}
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
                          {!review.ownerResponse && (
                            <button
                              onClick={() => handleRespondToReview(review)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-conexia-green border-b"
                            >
                              <Edit2 size={16} />
                              <span>Responder</span>
                            </button>
                          )}
                          {canReport && (
                            <button
                              onClick={() => handleReportReview(review)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-orange-600"
                            >
                              <Flag size={16} />
                              <span>Reportar reseña</span>
                            </button>
                          )}
                        </>
                      ) : (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) ? (
                        // Opciones para admin/moderador
                        <button
                          onClick={() => handleViewReports(review)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-blue-600"
                        >
                          <AlertCircle size={16} />
                          <span>Ver reportes</span>
                        </button>
                      ) : (
                        // Opción para reportar (usuarios que no son dueños ni del servicio)
                        canReport && (
                          <button
                            onClick={() => handleReportReview(review)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-orange-600"
                          >
                            <Flag size={16} />
                            <span>Reportar reseña</span>
                          </button>
                        )
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

              {/* Comentario - Editable si está en modo edición */}
              {editingReviewId === review.id ? (
                /* Modo edición: Comentario editable */
                <div className="mt-2">
                  <div className="relative">
                    <textarea
                      value={editingComment}
                      onChange={(e) => setEditingComment(e.target.value)}
                      placeholder="Comparte detalles sobre tu experiencia..."
                      className="w-full px-3 py-2 pb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#367d7d]/50 focus:border-[#367d7d] text-sm resize-none"
                      rows={3}
                      maxLength={500}
                      disabled={editLoading}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {editingComment.length}/500
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={editLoading}
                      className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleConfirmEdit(review.id)}
                      disabled={editLoading || !editingComment.trim() || editingComment.length < 10}
                      className="px-4 py-1.5 text-sm bg-[#367d7d] text-white rounded-lg hover:bg-[#2b6a6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo normal: Comentario solo lectura */
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
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => handleRespondToReview(review)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-conexia-green"
                        >
                          <Edit2 size={16} />
                          <span>Editar respuesta</span>
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(review)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm text-red-600"
                        >
                          <Trash2 size={16} />
                          <span>Eliminar respuesta</span>
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
      </div>

      {/* Link ver todas */}
      <div className="mt-6">
        <button
          onClick={() => {
            setSelectedRating(null);
            setShowAllReviewsModal(true);
          }}
          className="text-[#367d7d] hover:text-[#2b6a6a] font-medium text-sm inline-flex items-center gap-1 transition"
        >
          Ver todas las opiniones
        </button>
      </div>

      {/* Modal de todas las reseñas */}
      {showAllReviewsModal && (
        <AllReviewsModal
          serviceId={serviceId}
          isOpen={showAllReviewsModal}
          onClose={() => {
            setShowAllReviewsModal(false);
            setSelectedRating(null);
          }}
          initialData={reviewsData}
          filterRating={selectedRating}
          onReviewsChanged={() => {
            // Recargar reseñas cuando el modal se cierre con cambios
            loadReviews();
          }}
        />
      )}

      {/* Modal de eliminación */}
      <ReviewDeleteModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />

      {/* Modal de reporte */}
      <ReviewReportModal
        open={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmReport}
        loading={actionLoading}
      />

      {/* Modal de eliminación de respuesta */}
      <ResponseDeleteModal
        isOpen={showResponseDeleteModal}
        onClose={() => {
          setShowResponseDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmDeleteResponse}
        loading={actionLoading}
      />

      {/* Toast para notificaciones */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </>
  );
}
