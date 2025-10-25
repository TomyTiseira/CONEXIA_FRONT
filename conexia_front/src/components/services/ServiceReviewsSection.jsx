'use client';

import { useEffect, useState, useRef } from 'react';
import { Star, ChevronRight, ChevronDown } from 'lucide-react';
import { getServiceReviews } from '@/service/serviceReviews';
import { config } from '@/config';
import { getUserDisplayName } from '@/utils/formatUserName';
import AllReviewsModal from './AllReviewsModal';

export default function ServiceReviewsSection({ serviceId }) {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    loadReviews();
  }, [serviceId]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowRatingFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceReviews(serviceId, 1, 5);
      setReviewsData(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilterClick = (rating) => {
    setSelectedRating(rating);
    setShowRatingFilter(false);
    setShowAllReviewsModal(true);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Título principal */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas del Servicio</h2>

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
                      width: `${
                        total > 0
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
            {/* Encabezado de la reseña */}
            <div className="flex items-start gap-3 mb-3">
              <img
                src={
                  review.reviewUser?.profilePicture
                    ? `${config.IMAGE_URL}/${review.reviewUser.profilePicture}`
                    : '/images/default-avatar.png'
                }
                alt={`${review.reviewUser?.name || 'Usuario'} ${review.reviewUser?.lastName || ''}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewUser?.name} {review.reviewUser?.lastName}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
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
              </div>
            </div>

            {/* Comentario */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {review.comment}
            </p>

            {/* Respuesta del dueño */}
            {review.ownerResponse && (
              <div className="ml-8 mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-conexia-green">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-conexia-green">
                    Respuesta del prestador
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.ownerResponseDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.ownerResponse}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Link ver todas - estilo Mercado Libre */}
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
        />
      )}
    </>
  );
}
