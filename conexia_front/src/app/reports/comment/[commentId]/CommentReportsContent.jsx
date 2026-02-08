'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchCommentReports } from '@/service/reports/commentReportsFetch';
import Button from '@/components/ui/Button';
import Pagination from '@/components/common/Pagination';
import BackButton from '@/components/ui/BackButton';
import Toast from '@/components/ui/Toast';

export default function CommentReportsContent({ commentId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState([]);
  const [commentData, setCommentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [toast, setToast] = useState(null);

  // Obtener parámetros de retorno desde la URL
  const returnFilter = searchParams?.get('filter') || 'comments';
  const returnOrder = searchParams?.get('order') || 'reportCount';
  const returnPage = searchParams?.get('returnPage') || '1';

  // Inicializar página desde URL
  useEffect(() => {
    if (!searchParams) return;
    const qPageRaw = searchParams.get('page');
    const qPage = qPageRaw ? parseInt(qPageRaw, 10) : 1;
    if (!Number.isNaN(qPage) && qPage > 0) {
      setPage(qPage);
    }
  }, [searchParams]);

  // Cargar reportes del comentario
  useEffect(() => {
    if (!commentId) return;

    setLoading(true);

    fetchCommentReports(commentId, page, 10)
      .then((data) => {
        setReports(data?.data?.reports || []);
        setCommentData(data?.data?.comment || null);
        
        // Adaptar la paginación del backend al formato esperado por el componente
        const backendPagination = data?.data?.pagination;
        if (backendPagination) {
          setPagination({
            currentPage: backendPagination.page,
            totalPages: backendPagination.totalPages,
            totalItems: backendPagination.total,
            hasNextPage: backendPagination.page < backendPagination.totalPages,
            hasPreviousPage: backendPagination.page > 1
          });
        } else {
          setPagination(null);
        }
      })
      .catch((err) => {
        console.error('Error al cargar reportes del comentario:', err);
        setToast({ type: 'error', message: err.message || 'Error al cargar los reportes' });
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [commentId, page]);

  // Sincronizar URL con la página actual
  useEffect(() => {
    if (!commentId || page === 1) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.replace(`/reports/comment/${commentId}?${params.toString()}`, { scroll: false });
  }, [commentId, page, router]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewComment = () => {
    if (commentData?.publicationId) {
      router.push(`/publication/${commentData.publicationId}?highlightCommentId=${commentId}`);
    } else {
      setToast({ type: 'warning', message: 'No se pudo determinar la publicación del comentario.' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Fecha inválida';
    }
  };

  const getReasonLabel = (reason) => {
    return reason || 'Sin especificar';
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-24">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
        <h2 className="text-2xl font-bold text-conexia-green text-center">Reportes del Comentario</h2>
        {/* Botón en desktop a la derecha */}
        <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={handleViewComment}
            disabled={loading || !commentData?.publicationId}
          >
            Ver comentario
          </Button>
        </div>
        {/* Botón en mobile abajo */}
        <div className="sm:hidden mt-4 flex justify-center">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={handleViewComment}
            disabled={loading || !commentData?.publicationId}
          >
            Ver comentario
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
                <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron reportes para este comentario.</td>
              </tr>
            ) : (
              reports.map(report => (
                <tr key={report.id} className="border-b hover:bg-gray-50 h-auto align-top">
                  <td className="p-4 align-top break-words max-w-[180px] text-left">
                    <Link
                      href={`/profile/userProfile/${report.reporterId}`}
                      className="text-conexia-green font-medium hover:underline"
                    >
                      {report.reporterName || report.reporter?.email || 'Usuario desconocido'}
                    </Link>
                  </td>
                  <td className="p-4 align-top break-words max-w-[160px] text-left">
                    {getReasonLabel(report.reason)}
                    {report.reason === 'Otro' && report.otherReason && (
                      <div className="text-xs text-gray-500 mt-1">({report.otherReason})</div>
                    )}
                  </td>
                  <td className="p-4 align-top break-words max-w-[320px] text-left">
                    <div className="line-clamp-4 overflow-hidden" title={report.description}>
                      {report.description || 'Sin descripción'}
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
              page={pagination.currentPage || page}
              currentPage={pagination.currentPage}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Botón volver atrás debajo de la tabla */}
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
          isVisible
          onClose={() => setToast(null)}
          position="top-center"
        />
      )}
    </div>
  );
}
