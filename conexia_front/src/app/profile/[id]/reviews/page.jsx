"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { fetchAllUserReviews } from '@/service/reviews/reviewsFetch';
import { getProfileById } from '@/service/profiles/profilesFetch';
import ReviewItem from '@/components/reviews/ReviewItem';
import ReviewForm from '@/components/reviews/ReviewForm';
import Toast from '@/components/ui/Toast';
import Pagination from '@/components/common/Pagination';
import BackButton from '@/components/ui/BackButton';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { Star } from 'lucide-react';
import { ROLES } from '@/constants/roles';

export default function ReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const [profile, setProfile] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [hasUserReview, setHasUserReview] = useState(false);
  const searchParams = useSearchParams();
  const highlightReviewId = searchParams ? searchParams.get('highlightReviewId') : null;
  const [searchingForHighlight, setSearchingForHighlight] = useState(false);

  // Detectar de dónde viene el usuario para el botón "Volver"
  const fromReports = searchParams ? searchParams.get('from') === 'reports' : false;
  const returnFilter = searchParams?.get('returnFilter') || 'reviews';
  const returnOrder = searchParams?.get('returnOrder') || 'reportCount';
  const returnPage = searchParams?.get('returnPage') || '1';

  const isOwner = user && String(user.id) === String(id);
  const canAddReview = user && roleName === ROLES.USER && !isOwner && !hasUserReview;

  // Cargar perfil
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const data = await getProfileById(id);
        if (!mounted) return;
        setProfile(data.data?.profile || data.profile || null);
      } catch (err) {
        console.error('Error cargando perfil:', err);
        if (mounted) setProfile(null);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [id]);

  // Cargar reseñas
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllUserReviews(id, page);
        if (!mounted) return;
        setReviewsData(data);

        // Verificar si el usuario ya escribió una reseña
        if (user && roleName === ROLES.USER && !isOwner) {
          const allData = await fetchAllUserReviews(id, 1, 200);
          const found = (allData.reviews || []).some(r => r.reviewerUserId === user.id);
          if (mounted) setHasUserReview(found);
        }
      } catch (err) {
        if (mounted) setToast({ type: 'error', message: err.message });
        if (mounted) setReviewsData({ reviews: [], pagination: { page: 1, totalPages: 1 } });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; }
  }, [id, page, user, roleName, isOwner]);

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

  const onSaved = async () => {
    setFormOpen(false);
    setEditReview(null);
    setToast({ type: 'success', message: 'Reseña realizada exitosamente.' });
    if (user && roleName === ROLES.USER) setHasUserReview(true);
    try {
      const data = await fetchAllUserReviews(id, page);
      setReviewsData(data);
    } catch (e) {}
  };

  const onDeleted = async () => {
    setToast({ type: 'success', message: 'Reseña eliminada' });
    try {
      const data = await fetchAllUserReviews(id, page);
      setReviewsData(data);
      if (user && roleName === ROLES.USER) {
        const all = await fetchAllUserReviews(id, 1, 200);
        const found = (all.reviews || []).some(r => r.reviewerUserId === user.id);
        setHasUserReview(found);
      }
    } catch (e) {}
  };

  // Mensajes dinámicos según el rol
  const getEmptyMessage = () => {
    if (isOwner) {
      return {
        main: "Aún no hay reseñas en tu perfil",
        sub: null
      };
    } else if (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) {
      return {
        main: "Aún no hay reseñas para este usuario",
        sub: null
      };
    } else {
      return {
        main: "Aún no hay reseñas para este usuario",
        sub: "Sé el primero en compartir tu experiencia"
      };
    }
  };

  const emptyMessage = getEmptyMessage();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#eaf5f2] pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* ProfileSidebar mobile (arriba) */}
            <div className="block md:hidden w-full mb-2">
              {profile && <ProfileSidebar profile={profile} userId={id} />}
            </div>

            {/* ProfileSidebar desktop/tablet - izquierda */}
            {profile && (
              <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                <ProfileSidebar profile={profile} userId={id} />
                {/* Botón volver en desktop */}
                <div className="mt-4">
                  <BackButton
                    onClick={() => {
                      if (fromReports) {
                        router.push(`/reports?filter=${returnFilter}&order=${returnOrder}&page=${returnPage}`);
                      } else {
                        router.push(`/profile/userProfile/${id}`);
                      }
                    }}
                    text={fromReports ? "Volver a los reportes" : "Volver al perfil"}
                  />
                </div>
              </aside>
            )}

            {/* Contenido principal - derecha */}
            <div className="flex-1 min-w-0 w-full md:w-3/4 lg:w-4/5">
              <div className="bg-white rounded-2xl shadow-md p-6">
                {/* Header con título, subtítulo y botón */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-xl md:text-2xl font-bold text-conexia-green">
                        {isOwner ? 'Mis reseñas profesionales' : 'Reseñas profesionales'}
                      </h1>
                    </div>
                    <p className="text-sm md:text-base text-gray-600">
                      {isOwner
                        ? 'Opiniones y experiencias de quienes han trabajado contigo'
                        : 'Opiniones y experiencias de quienes han trabajado con este profesional'}
                    </p>
                  </div>
                  {canAddReview && (
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

                {/* Contenido de reseñas */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Cargando reseñas...</p>
                  </div>
                ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map(r => (
                      <ReviewItem 
                        key={r.id} 
                        review={r} 
                        highlighted={String(r.id) === String(highlightReviewId)}
                        onEdit={() => { setEditReview(r); setFormOpen(true); }}
                        onDeleted={onDeleted}
                        onReportSuccess={async () => {
                          try {
                            const data = await fetchAllUserReviews(id, page);
                            setReviewsData(data);
                          } catch (e) {}
                        }}
                        profileOwnerId={Number(id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Star size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">{emptyMessage.main}</p>
                    {emptyMessage.sub && (
                      <p className="text-gray-400 text-sm mt-1">{emptyMessage.sub}</p>
                    )}
                  </div>
                )}

                {/* Paginación */}
                {reviewsData.pagination?.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={reviewsData.pagination.page || 1}
                      totalPages={reviewsData.pagination.totalPages || 1}
                      hasNextPage={reviewsData.pagination.hasNext || false}
                      hasPreviousPage={reviewsData.pagination.hasPrev || false}
                      onPageChange={setPage}
                    />
                  </div>
                )}

                {/* Botón volver en mobile */}
                <div className="lg:hidden mt-6 pt-6 border-t">
                  <BackButton
                    onClick={() => {
                      if (fromReports) {
                        router.push(`/reports?filter=${returnFilter}&order=${returnOrder}&page=${returnPage}`);
                      } else {
                        router.push(`/profile/userProfile/${id}`);
                      }
                    }}
                    text={fromReports ? "Volver a los reportes" : "Volver al perfil"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de formulario */}
      {formOpen && (
        <ReviewForm
          initial={editReview}
          reviewedUserId={id}
          onClose={() => { setFormOpen(false); setEditReview(null); }}
          onSaved={onSaved}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
    </>
  );
}
