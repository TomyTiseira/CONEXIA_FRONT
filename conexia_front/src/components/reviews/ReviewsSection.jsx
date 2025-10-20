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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchUserReviews(profileUserId, { limit: 2 });
        if (!mounted) return;
        setReviewsData(data);
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; }
  }, [profileUserId]);

  const canAdd = user && roleName === 'user' && user.id !== Number(profileUserId);

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reseñas</h3>
        <div>
          {canAdd && (
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
              <ReviewItem key={r.id} review={r} onEdit={() => { setEditReview(r); setFormOpen(true); }} onDeleted={onDeleted} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aún no hay reseñas.</p>
        )}
      </div>

      <div className="mt-4">
        <Link href={`/profile/${profileUserId}/reviews`} className="text-conexia-green">Ver más</Link>
      </div>

      {formOpen && (
        <ReviewForm
          initial={editReview}
          reviewedUserId={profileUserId}
          onClose={() => { setFormOpen(false); setEditReview(null); }}
          onSaved={onSaved}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} />}
    </div>
  );
}
