"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { fetchAllUserReviews } from '@/service/reviews/reviewsFetch';
import ReviewItem from '@/components/reviews/ReviewItem';
import Toast from '@/components/ui/Toast';
import Pagination from '@/components/common/Pagination';
import BackButton from '@/components/ui/BackButton';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function ReviewsPage(/* { params } */) {
  const { id } = useParams();
  const router = useRouter();
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const searchParams = useSearchParams();
  const highlightReviewId = searchParams ? searchParams.get('highlightReviewId') : null;
  const [searchingForHighlight, setSearchingForHighlight] = useState(false);

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
        // Fallback: cargar reseñas mock para poder mostrar la UI en pruebas
        if (mounted) {
          setReviewsData({
            reviews: [
              {
                id: 'mock-1',
                relationship: 'Compañero de equipo',
                description: 'Muy comprometido y proactivo en las tareas del proyecto.',
                reporterId: 21,
                reporter: { email: 'ana.gomez@example.com' },
                createdAt: new Date().toISOString()
              },
              {
                id: 'mock-2',
                relationship: 'Líder técnico',
                description: 'Aportó soluciones limpias y documentadas.',
                reporterId: 22,
                reporter: { email: 'luis.martin@example.com' },
                createdAt: new Date().toISOString()
              }
            ],
            pagination: { page: 1, totalPages: 1, hasNext: false, hasPrev: false }
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; }
  }, [id, page]);

  // When a highlightReviewId is provided, try to locate the review in the current page.
  // If not found, attempt to fetch pages until we locate it and set the page where it exists.
  useEffect(() => {
    if (!highlightReviewId) return;
    let cancelled = false;

    const tryScroll = () => {
      const el = document.getElementById(`review-${highlightReviewId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-conexia-green/30');
        // Remove highlight after a few seconds
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-conexia-green/30');
        }, 4500);
        return true;
      }
      return false;
    };

    const findOnPages = async () => {
      try {
        setSearchingForHighlight(true);
        // First try current DOM (in case it was rendered)
        if (tryScroll()) {
          setSearchingForHighlight(false);
          return;
        }

        // If pagination info available, iterate pages to find the review
        const totalPages = reviewsData.pagination?.totalPages || 1;
        for (let p = 1; p <= totalPages; p++) {
          if (cancelled) return;
          // Skip fetching the page already displayed
          if (p === page) continue;
          const data = await fetchAllUserReviews(id, p);
          if (!data || !Array.isArray(data.reviews)) continue;
          const found = data.reviews.find(r => String(r.id) === String(highlightReviewId));
          if (found) {
            // Navigate to the page where it exists. The existing page effect will load it.
            setPage(p);
            // Wait a bit for the UI to update and try to scroll
            setTimeout(() => {
              tryScroll();
            }, 600);
            setSearchingForHighlight(false);
            return;
          }
        }

        // Last attempt: try current page DOM again after small delay
        setTimeout(() => {
          if (!cancelled) tryScroll();
        }, 400);
      } catch (err) {
        console.error('Error buscando reseña highlight:', err);
      } finally {
        if (!cancelled) setSearchingForHighlight(false);
      }
    };

    // Delay to let initial render complete
    setTimeout(() => {
      if (!cancelled) findOnPages();
    }, 300);

    return () => { cancelled = true; };
  }, [highlightReviewId, id, page, reviewsData]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        {/* Header with title and subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Reseñas</h1>
          <p className="text-gray-600">
            Opiniones y valoraciones de colaboradores sobre este usuario
          </p>
        </div>

      {loading ? (
        <p>Cargando...</p>
      ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.reviews.map(r => (
            <ReviewItem 
              key={r.id} 
              review={r} 
              highlighted={String(r.id) === String(highlightReviewId)}
              onDeleted={async () => { 
                setToast({ type: 'success', message: 'Reseña eliminada' }); 
                // Recargar reseñas
                const data = await fetchAllUserReviews(id, page);
                setReviewsData(data);
              }}
              profileOwnerId={Number(id)}
            />
          ))}
        </div>
      ) : (
        <p>No hay reseñas aún.</p>
      )}

      {reviewsData.pagination?.totalPages > 1 && (
        <Pagination
          currentPage={reviewsData.pagination.page || 1}
          totalPages={reviewsData.pagination.totalPages || 1}
          hasNextPage={reviewsData.pagination.hasNext || false}
          hasPreviousPage={reviewsData.pagination.hasPrev || false}
          onPageChange={setPage}
        />
      )}

      {/* Back button */}
      <div className="mt-8 pt-6 border-t">
        <BackButton
          onClick={() => router.back()}
          text="Volver al perfil"
        />
      </div>

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
    </div>
    </>
  );
}
