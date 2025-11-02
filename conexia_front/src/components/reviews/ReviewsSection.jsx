'use client';
import React, { useState, useEffect } from 'react';
import { fetchUserReviews } from '@/service/reviews/reviewsFetch';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';

export default function ReviewsSection({ profileUserId }) {
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {}, hasReviewed: false });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUserReviews(profileUserId, { limit: 2 });
      setReviewsData(data);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
      setReviewsData({
        reviews: [],
        pagination: { page: 1, totalPages: 1 },
        hasReviewed: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profileUserId]);

  // Verificar si el usuario actual es el dueño del perfil
  const isOwner = user && user.id === Number(profileUserId);
  
  // Usuario puede agregar reseña solo si: está autenticado, es user, NO es el dueño del perfil y NO ha hecho una reseña aún
  const canAdd = user && roleName === 'user' && !isOwner && !reviewsData.hasReviewed;

  const onSaved = async () => {
    setFormOpen(false);
    setEditReview(null);
    setToast({ type: 'success', message: 'Reseña guardada' });
    try {
      const data = await fetchUserReviews(profileUserId, { limit: 2 });
      setReviewsData(data);
    } catch (e) {}
  };

  const onDeleted = async () => {
    setToast({ type: 'success', message: 'Reseña eliminada' });
    try {
      const data = await fetchUserReviews(profileUserId, { limit: 2 });
      setReviewsData(data);
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header con título, descripción y botón */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-conexia-green mb-1">
              {isOwner ? 'Mis reseñas profesionales' : 'Reseñas profesionales'}
            </h3>
            <p className="text-sm text-gray-600">
              {isOwner 
                ? 'Opiniones y experiencias de quienes han trabajado contigo.' 
                : 'Opiniones y experiencias de quienes han trabajado con este profesional'}
            </p>
          </div>
          {canAdd && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-conexia-green text-white rounded-lg font-semibold hover:bg-conexia-green/90 transition-colors shadow-sm whitespace-nowrap"
            >
              <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              <span>Agregar reseña</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando reseñas...</p>
        ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.reviews.map(r => (
              <ReviewItem 
                key={r.id} 
                review={r} 
                onEdit={() => { setEditReview(r); setFormOpen(true); }} 
                onDeleted={onDeleted}
                onReportSuccess={() => {
                  // Recargar reseñas después de reportar para actualizar hasReported
                  load();
                }}
                profileOwnerId={Number(profileUserId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-gray-500 font-medium">Aún no hay reseñas</p>
            <p className="text-gray-400 text-sm mt-1">Sé el primero en compartir tu experiencia</p>
          </div>
        )}
      </div>

      {/* Botón ver más */}
      {reviewsData.reviews && reviewsData.reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
          <a
            href={`/profile/${profileUserId}/reviews`}
            className="w-full sm:w-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
            style={{ minHeight: '40px' }}
          >
            <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
            </svg>
            <span className="w-full text-center">Ver más…</span>
          </a>
        </div>
      )}

      {formOpen && (
        <ReviewForm
          initial={editReview}
          reviewedUserId={profileUserId}
          onClose={() => { setFormOpen(false); setEditReview(null); }}
          onSaved={onSaved}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
    </div>
  );
}
