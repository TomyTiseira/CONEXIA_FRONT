'use client';
import React, { useState, useEffect } from 'react';
import { fetchUserReviews } from '@/service/reviews/reviewsFetch';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import Link from 'next/link';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { Star } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ReviewsSection({ profileUserId }) {
  const { user } = useAuth();
  const { roleName } = useUserStore();

  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {}, hasReviewed: false });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [toast, setToast] = useState(null);

  // Load reviews and check if current user already reviewed
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUserReviews(profileUserId, { limit: 2 });
        if (!mounted) return;
        setReviewsData(data);

        if (user && roleName === 'user') {
          try {
            const all = await fetchUserReviews(profileUserId, { limit: 200 });
            if (!mounted) return;
            const found = (all.reviews || []).some(r => r.reviewerUserId === user.id);
            setHasUserReview(Boolean(found));
          } catch (e) {
            if (mounted) setHasUserReview(false);
          }
        }
      } catch (err) {
        if (mounted) setToast({ type: 'error', message: err.message });
        if (mounted) setReviewsData({ reviews: [], pagination: { page: 1, totalPages: 1 } });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [profileUserId, user?.id, roleName]);

  // Determine permissions
  const isOwner = user && user.id === Number(profileUserId);
  const canAdd = user && roleName === 'user' && !isOwner && !hasUserReview;

  // Si es el dueño y no tiene reseñas, no mostrar la sección
  if (isOwner && (!reviewsData.reviews || reviewsData.reviews.length === 0) && !loading) {
    return null;
  }

  const onSaved = async () => {
    setFormOpen(false);
    setEditReview(null);
    setToast({ type: 'success', message: 'Reseña realizada exitosamente.' });
    if (user && roleName === 'user') setHasUserReview(true);
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
      if (user && roleName === 'user') {
        const all = await fetchUserReviews(profileUserId, { limit: 200 });
        const found = (all.reviews || []).some(r => r.reviewerUserId === user.id);
        setHasUserReview(Boolean(found));
      }
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-6 h-6 text-conexia-green fill-conexia-green" />
            <h3 className="text-base md:text-lg font-bold text-conexia-green">
              {isOwner ? 'Mis reseñas profesionales' : 'Reseñas profesionales'}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600">
            {isOwner
              ? 'Opiniones y experiencias de quienes han trabajado contigo.'
              : 'Opiniones y experiencias de quienes han trabajado con este profesional'}
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-conexia-green text-white rounded-lg font-medium hover:bg-conexia-green/90 transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            <span>Agregar</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner message="Cargando reseñas" fullScreen={false} />
        ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.reviews.map(r => (
              <ReviewItem
                key={r.id}
                review={r}
                onEdit={() => { setEditReview(r); setFormOpen(true); }}
                onDeleted={onDeleted}
                onReportSuccess={async () => {
                  // Recargar reseñas después de reportar para actualizar hasReported
                  try {
                    const data = await fetchUserReviews(profileUserId, { limit: 2 });
                    setReviewsData(data);
                  } catch (e) {}
                }}
                profileOwnerId={Number(profileUserId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Star size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {isOwner ? 'Aún no hay reseñas en tu perfil' : 'Aún no hay reseñas'}
            </p>
            {!isOwner && (
              <p className="text-gray-400 text-sm mt-1">Sé el primero en compartir tu experiencia</p>
            )}
          </div>
        )}
      </div>

      {/* Ver más */}
      {reviewsData.reviews && reviewsData.reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
          <Link
            href={`/profile/${profileUserId}/reviews`}
            className="w-full sm:w-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
            style={{ minHeight: '40px' }}
          >
            <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
            </svg>
            <span className="w-full text-center">Ver más…</span>
          </Link>
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
