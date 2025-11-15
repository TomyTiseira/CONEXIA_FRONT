'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteReview } from '@/service/reviews/reviewsFetch';
import { createReviewReport } from '@/service/reports/reviewReportsFetch';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import ReportReviewModal from './ReportReviewModal';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';

export default function ReviewItem({ review, onEdit, onDeleted, onReportSuccess, profileOwnerId, highlighted = false }) {
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localReview, setLocalReview] = useState(review);

  const isOwner = user?.id === localReview.reviewerUserId;
  const isProfileOwner = user?.id === profileOwnerId;
  // Solo los usuarios regulares pueden reportar reseñas. Moderadores/administradores no deben ver esta opción.
  const canReport = user && !isOwner && roleName === 'user';

  // Para moderadores/administradores, SIEMPRE mostrar opción de "Ver reportes"
  // Los roles pueden venir en inglés o español según el backend
  const canModerate = user && (roleName === 'admin' || roleName === 'moderator' || roleName === 'administrador' || roleName === 'moderador');
  const hasReports = (localReview.reportCount && localReview.reportCount > 0) || (localReview.reports && localReview.reports.length > 0);

  // If this review is the one highlighted via query param (prop), treat it as having reports for admins
  const isHighlighted = highlighted;
  const reviewId = localReview.id || localReview.userReviewId;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteReview(localReview.id);
      setToast({ type: 'success', message: 'Reseña eliminada' });
      onDeleted();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleReportClick = () => {
    setMenuOpen(false);
    
    // No permitir reportar si es admin o moderador
    if (!canReport) {
      setToast({ type: 'warning', message: 'No tienes permisos para reportar reseñas' });
      return;
    }
    
    // Verificar si ya fue reportado antes de abrir el modal
    if (localReview.hasReported) {
      setToast({ type: 'warning', message: 'Ya has reportado esta reseña' });
      return;
    }
    setReportModalOpen(true);
  };

  const handleReportSubmit = async (reportData) => {
    setReportLoading(true);
    try {
      await createReviewReport({
        userReviewId: localReview.id,
        reason: reportData.reason,
        otherReason: reportData.otherReason,
        description: reportData.description
      });
      
      // Cerrar modal solo si fue exitoso
      setReportModalOpen(false);
      
      // Actualizar estado local para marcar como reportado
      setLocalReview(prev => ({ ...prev, hasReported: true }));
      
      setToast({ type: 'success', message: 'Reporte enviado correctamente' });
      
      // Notificar al padre para recargar datos
      if (onReportSuccess) {
        onReportSuccess();
      }
    } catch (err) {
      // Cerrar modal en caso de error
      setReportModalOpen(false);
      
      // Detectar si ya fue reportado previamente
      const alreadyReportedPatterns = [
        /already reported/i,
        /ya has reportado/i,
        /You have already reported this review/i,
        /User \d+ has already reported user review \d+/i
      ];
      
      const isAlreadyReported = alreadyReportedPatterns.some(pattern => 
        err.message && pattern.test(err.message)
      );
      
      if (isAlreadyReported) {
        // Actualizar estado local para reflejar que ya fue reportado
        setLocalReview(prev => ({ ...prev, hasReported: true }));
        setToast({ type: 'warning', message: 'Ya has reportado esta reseña' });
      } else {
        console.error('Error al reportar reseña:', err);
        setToast({ type: 'error', message: err.message || 'Error al enviar el reporte' });
      }
    } finally {
      setReportLoading(false);
    }
  };

  // Foto de perfil del reviewer (cuando el backend la devuelva)
  const reviewerAvatar = review.reviewerUser?.profilePicture 
    ? `${config.IMAGE_URL}/${review.reviewerUser.profilePicture}`
    : '/images/default-avatar.png';

  // Navegar al perfil del reviewer usando reviewerUserId
  const handleProfileClick = () => {
    if (review.reviewerUserId) {
      router.push(`/profile/userProfile/${review.reviewerUserId}`);
    }
  };

  return (
  <div id={`review-${localReview.id || localReview.userReviewId}`} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Foto de perfil del reviewer a la izquierda */}
        <div className="flex-shrink-0">
          <div 
            onClick={handleProfileClick}
            className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 relative cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
          >
            <Image
              src={reviewerAvatar}
              alt={`${review.reviewerUser?.name || 'Usuario'}`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Contenido de la reseña */}
        <div className="flex-1 min-w-0">
          {/* Encabezado: nombre, relación y fecha */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span 
                onClick={handleProfileClick}
                className="font-semibold text-gray-900 cursor-pointer hover:text-conexia-green transition-colors"
                role="button"
                tabIndex={0}
              >
                {review.reviewerUser?.name} {review.reviewerUser?.lastName}
              </span>
              <span className="text-sm text-gray-700 font-bold">·</span>
              <span className="text-sm text-gray-700 font-medium">{review.relationship}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(review.createdAt).toLocaleDateString('es-AR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Descripción de la reseña */}
          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
            {review.description}
          </div>
        </div>

        {/* Botones de acción */}
        {(isOwner || canReport || canModerate) && (
          <div className="relative flex items-start">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
              title="Opciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>

            {/* Menú desplegable */}
            {menuOpen && (
              <>
                {/* Overlay para cerrar el menú al hacer clic fuera */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                
                {/* Menú de opciones */}
                <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
                  {/* Opciones para el autor de la reseña */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Editar reseña
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Eliminar reseña
                      </button>
                    </>
                  )}

                  {/* Opción "Ver reportes" para moderadores/administradores - SIEMPRE visible */}
                  {canModerate && (
                    <>
                      {(isOwner || isProfileOwner) && <div className="border-t my-1" />}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          // Redirigir a la vista de reportes para esta reseña
                          router.push(`/reports/review?reviewId=${localReview.id || localReview.userReviewId}`);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ver reportes
                      </button>
                    </>
                  )}

                  {canReport && (
                    <>
                      {isOwner && <div className="border-t my-1" />}
                      <button
                        onClick={handleReportClick}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Reportar reseña
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDeleteModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}

      {reportModalOpen && (
        <ReportReviewModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          loading={reportLoading}
          reviewId={review.id}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
    </div>
  );
}
