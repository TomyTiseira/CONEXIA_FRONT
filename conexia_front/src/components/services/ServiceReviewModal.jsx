'use client';

import { useState } from 'react';
import { X, Star, FileText, Calendar, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createServiceReview } from '@/service/serviceReviews';
import { config } from '@/config';
import { getUserDisplayName } from '@/utils/formatUserName';

export default function ServiceReviewModal({ hiring, isOpen, onClose, onSuccess, onError }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !hiring) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Derivar información del dueño del servicio
  const ownerRaw = hiring.owner || hiring.service?.owner || hiring.service?.user || null;
  const ownerNameFromFull = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      name: parts[0] || '',
      lastName: parts[1] || ''
    };
  };
  const ownerNameFields = ownerRaw?.fullName
    ? ownerNameFromFull(ownerRaw.fullName)
    : { name: ownerRaw?.firstName ?? ownerRaw?.name ?? '', lastName: ownerRaw?.lastName ?? '' };
  const ownerDisplayName = ownerRaw
    ? getUserDisplayName({ name: ownerNameFields.name, lastName: ownerNameFields.lastName })
    : 'Usuario';
  const ownerImage = ownerRaw?.profileImage || ownerRaw?.profilePicture || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      onError?.('Debes seleccionar una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      onError?.('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      await createServiceReview({
        hiringId: hiring.id,
        rating,
        comment: comment.trim(),
      });

      onSuccess?.('Reseña enviada exitosamente');
      
      setTimeout(() => {
        onClose();
        // Resetear el formulario
        setRating(0);
        setComment('');
      }, 1500);
    } catch (error) {
      onError?.(error.message || 'Error al enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = rating > 0 && comment.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-conexia-green">
              Calificar Servicio
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content - Scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Información del servicio solicitado */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} className="text-conexia-green" />
              Servicio Solicitado
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Título:</span>
                <p className="text-gray-900 mt-1">{hiring.service?.title}</p>
              </div>
              {ownerRaw && (
                <div>
                  <span className="font-medium text-gray-700">Dueño del servicio:</span>
                  <div className="mt-2 flex items-center gap-2">
                    {ownerImage ? (
                      <img
                        src={`${config.IMAGE_URL}/${ownerImage}`}
                        alt={ownerDisplayName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                    )}
                    <span className="text-gray-900 font-medium">{ownerDisplayName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de calificación */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calificación con estrellas - Centrado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 ">
                Calificación <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isSubmitting}
                    className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-center text-gray-600 mt-2">
                  {rating === 1 && 'Muy insatisfecho'}
                  {rating === 2 && 'Insatisfecho'}
                  {rating === 3 && 'Neutral'}
                  {rating === 4 && 'Satisfecho'}
                  {rating === 5 && 'Muy satisfecho'}
                </p>
              )}
            </div>

            {/* Comentario */}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cuéntanos tu experiencia <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="comment"
                  rows={6}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte detalles sobre tu experiencia con este servicio... ¿Qué te gustó? ¿Qué podría mejorar?"
                  maxLength={1000}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent hover:border-conexia-green/60 outline-none transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              {/* Contador y guía de caracteres debajo del campo */}
              <div className="mt-2 text-xs text-gray-600">
                Mínimo 10 caracteres. {comment.length}/1000
              </div>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Tu reseña será visible públicamente y ayudará a otros usuarios a tomar decisiones informadas.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <Button
              variant="cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className="bg-conexia-green hover:bg-conexia-green/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
