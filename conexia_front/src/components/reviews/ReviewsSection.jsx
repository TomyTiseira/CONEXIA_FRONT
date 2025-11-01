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
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchUserReviews(profileUserId, { limit: 2 });
        if (!mounted) return;
        setReviewsData(data);
        // Si el usuario está autenticado y es un usuario regular, verificar si ya dejó una reseña
        if (user && roleName === 'user') {
          try {
            // Traer un conjunto mayor de reseñas para comprobar si el usuario ya reseñó este perfil.
            // Usamos un límite alto para evitar paginar en el cliente. Si existen muchos items en
            // el futuro, podríamos añadir un endpoint específico en el backend.
            const all = await fetchUserReviews(profileUserId, { limit: 200 });
            if (!mounted) return;
            const found = (all.reviews || []).some(r => r.reviewerUserId === user.id);
            setHasUserReview(Boolean(found));
          } catch (e) {
            // Si falla la verificación, no bloquear la UI: asumir que no hay reseña del usuario.
            if (mounted) setHasUserReview(false);
          }
        }
      } catch (err) {
        // Si falla la API, cargar datos mock para poder probar la UI
        setToast({ type: 'error', message: err.message });
        if (mounted) {
          setReviewsData({
            reviews: [
            ],
            pagination: { page: 1, totalPages: 1 }
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; }
  }, [profileUserId, user?.id, roleName]);

  const canAdd = user && roleName === 'user' && user.id !== Number(profileUserId);
  const canAddFinal = canAdd && !hasUserReview;

  const onSaved = async () => {
    setFormOpen(false);
    setEditReview(null);
    setToast({ type: 'success', message: 'Reseña guardada' });
    // Al guardar, asumimos que el usuario actual ahora tiene una reseña
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
      // Si el usuario actual borró su reseña, actualizar el flag
      if (user && roleName === 'user') {
        const all = await fetchUserReviews(profileUserId, { limit: 200 });
        const found = (all.reviews || []).some(r => r.reviewerUserId === user.id);
        setHasUserReview(Boolean(found));
      }
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reseñas</h3>
        <div>
          {canAddFinal && (
            <Button variant="primary" onClick={() => setFormOpen(true)}>Agregar reseña</Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <p>Cargando reseñas...</p>
        ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.reviews.map(r => (
              <ReviewItem 
                key={r.id} 
                review={r} 
                onEdit={() => { setEditReview(r); setFormOpen(true); }} 
                onDeleted={onDeleted}
                profileOwnerId={Number(profileUserId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aún no hay reseñas.</p>
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
