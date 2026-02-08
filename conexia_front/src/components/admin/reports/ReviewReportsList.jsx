"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { fetchReviewReports } from '@/service/reports/reviewReportsFetch';
import Pagination from '@/components/common/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/ui/Toast';

export default function ReviewReportsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState([]);
  const [reviewId, setReviewId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [toast, setToast] = useState(null);

  // Obtener parámetros de retorno desde la URL
  const returnFilter = searchParams?.get('filter') || 'reviews';
  const returnOrder = searchParams?.get('order') || 'reportCount';
  const returnPage = searchParams?.get('returnPage') || '1';

  // Get review ID from URL
  useEffect(() => {
    if (!searchParams) return;
    const id = searchParams.get('reviewId');
    if (id) {
      setReviewId(parseInt(id, 10));
    }
    const qPageRaw = searchParams.get('page');
    const qPage = qPageRaw ? parseInt(qPageRaw, 10) : 1;
    if (!Number.isNaN(qPage) && qPage > 0) setPage(qPage);
  }, [searchParams]);

  // Fetch reports for specific review
  useEffect(() => {
    if (!reviewId) return;
    setLoading(true);
    fetchReviewReports(reviewId, page)
      .then(response => {
        const reportsData = response.data?.reports || [];
        setReports(reportsData);
        setPagination(response.data?.pagination || null);
        // Guardar datos de la reseña - puede venir en el primer reporte o directamente en response.data
        const reviewInfo = response.data?.userReview || (reportsData.length > 0 ? reportsData[0].userReview : null);
        if (reviewInfo) {
          setReviewData(reviewInfo);
        }
      })
      .catch(err => {
        setToast({ type: 'error', message: err.message || 'Error al cargar reportes' });
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [reviewId, page]);

  // Sync URL
  useEffect(() => {
    if (!reviewId) return;
    const params = new URLSearchParams();
    params.set('reviewId', String(reviewId));
    params.set('page', String(page));
    router.replace(`/reports/review?${params.toString()}`, { scroll: false });
  }, [reviewId, page, router]);


  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReasonLabel = (reason) => {
    const labels = {
      'Spam': 'Spam',
      'Acoso': 'Acoso',
      'Contenido ofensivo': 'Contenido ofensivo',
      'Información falsa': 'Información falsa',
      'Otro': 'Otro',
    };
    return labels[reason] || reason;
  };

  const handleViewReview = () => {
    // El endpoint devuelve reviewedUserId directamente en cada reporte
    let profileId = null;
    
    if (reports.length > 0) {
      // Usar reviewedUserId del primer reporte (todos tienen el mismo reviewedUserId)
      profileId = reports[0].reviewedUserId;
    }
    
    if (profileId) {
      // Pasar parámetros para que el botón volver sea dinámico
      router.push(`/profile/${profileId}/reviews?highlightReviewId=${reviewId}&from=reports&returnFilter=${returnFilter}&returnOrder=${returnOrder}&returnPage=${returnPage}`);
    } else {
      setToast({ type: 'warning', message: 'No se pudo determinar el perfil del usuario.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-24">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
        <h2 className="text-2xl font-bold text-conexia-green text-center">Reportes de la Reseña de Usuario</h2>
        {/* Botón en desktop a la derecha */}
        <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={handleViewReview}
            disabled={loading || reports.length === 0}
          >
            Ver reseña en perfil
          </Button>
        </div>
        {/* Botón en mobile abajo */}
        <div className="sm:hidden mt-4 flex justify-center">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={handleViewReview}
            disabled={loading || reports.length === 0}
          >
            Ver reseña en perfil
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-0 overflow-x-auto mx-4 md:mx-0">
            <table className="min-w-full table-auto text-sm mb-0">
              <colgroup>
                <col className="w-[160px] md:w-[180px]" />
                <col className="w-[120px] md:w-[160px]" />
                <col className="w-[180px] md:w-[320px]" />
                <col className="w-[120px] md:w-[160px]" />
              </colgroup>
              <thead>
                <tr className="border-b">
                  <th className="p-4 min-w-[120px] max-w-[180px] text-left">Reportado por</th>
                  <th className="p-4 min-w-[80px] max-w-[160px] text-left">Razón</th>
                  <th className="p-4 min-w-[120px] max-w-[320px] text-left">Descripción</th>
                  <th className="p-4 min-w-[90px] max-w-[160px] text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">
                      No se encontraron reportes para esta reseña
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr key={`report-${report.id}-${index}`} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top break-words max-w-[180px] text-left">
                        <Link 
                          href={`/profile/userProfile/${report.reporterId}`}
                          className="text-conexia-green hover:underline font-medium text-sm"
                        >
                          {report.reporter?.name} {report.reporter?.lastName}
                        </Link>
                      </td>
                      <td className="p-4 align-top break-words max-w-[160px] text-left">
                        <div className="text-sm text-gray-900">
                          {getReasonLabel(report.reason)}
                        </div>
                        {report.otherReason && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({report.otherReason})
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top break-words max-w-[320px] text-left">
                        <div className="whitespace-pre-wrap break-words sm:line-clamp-4 overflow-hidden" title={report.description}>
                          {report.description}
                        </div>
                      </td>
                      <td className="p-4 align-top break-words max-w-[160px] whitespace-nowrap text-center">
                        {formatDate(report.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {pagination && (
              <div className="pt-4 pb-6 flex justify-center">
                <Pagination
                  page={page}
                  currentPage={page}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

      <div className="mx-4 md:mx-0 mt-4">
        <BackButton 
          text="Volver a los reportes" 
          onClick={() => router.push(`/reports?filter=${returnFilter}&order=${returnOrder}&page=${returnPage}`)} 
        />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          isVisible
        />
      )}
    </div>
  );
}
