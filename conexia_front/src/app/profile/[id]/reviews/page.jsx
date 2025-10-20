'use client';
import React, { useState, useEffect } from 'react';
import { fetchAllUserReviews } from '@/service/reviews/reviewsFetch';
import ReviewItem from '@/components/reviews/ReviewItem';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

export default function ReviewsPage({ params }) {
  const { id } = params;
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllUserReviews(id, page);
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
  }, [id, page]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reseñas</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.reviews.map(r => (
            <ReviewItem key={r.id} review={r} onDeleted={async () => { setToast({ type: 'success', message: 'Reseña eliminada' }); }} />
          ))}
        </div>
      ) : (
        <p>No hay reseñas aún.</p>
      )}

      <div className="flex justify-between items-center mt-6">
        <Button disabled={!reviewsData.pagination?.hasPrev} onClick={() => setPage(p => Math.max(1, p -1))} variant="outline">Anterior</Button>
        <span>Página {reviewsData.pagination.page} de {reviewsData.pagination.totalPages}</span>
        <Button disabled={!reviewsData.pagination?.hasNext} onClick={() => setPage(p => p + 1)} variant="outline">Siguiente</Button>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} />}
    </div>
  );
}
