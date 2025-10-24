"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchReviewReports, resolveReviewReport } from '@/service/reports/reviewReportsFetch';
import { deleteReview } from '@/service/reviews/reviewsFetch';
import { MdKeyboardArrowDown } from 'react-icons/md';
import Pagination from '@/components/common/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/ui/Toast';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

const STATUS_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Resueltos', value: 'resolved' },
  { label: 'Rechazados', value: 'rejected' },
];

export default function ReviewReportsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [expandedReports, setExpandedReports] = useState(new Set());

  // Initialize from URL
  useEffect(() => {
    if (!searchParams) return;
    const qStatus = searchParams.get('status');
    const qPageRaw = searchParams.get('page');
    const qPage = qPageRaw ? parseInt(qPageRaw, 10) : 1;
    if (qStatus) setStatus(qStatus);
    if (!Number.isNaN(qPage) && qPage > 0) setPage(qPage);
  }, [searchParams]);

  // Fetch reports
  useEffect(() => {
    setLoading(true);
    fetchReviewReports({ page, limit: 15, status })
      .then(response => {
        setReports(response.data?.reports || []);
        setPagination(response.data?.pagination || null);
      })
      .catch(err => {
        setToast({ type: 'error', message: err.message || 'Error al cargar reportes' });
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    router.replace(`/reports/review?${params.toString()}`, { scroll: false });
  }, [status, page, router]);

  // Reset page when status changes
  useEffect(() => {
    setPage(1);
  }, [status]);

  const handleResolve = async (reportId, action) => {
    setActionLoading(true);
    try {
      await resolveReviewReport(reportId, action);
      setToast({ type: 'success', message: `Reporte ${action === 'approve' ? 'aprobado' : 'rechazado'}` });
      // Reload reports
      const response = await fetchReviewReports({ page, limit: 15, status });
      setReports(response.data?.reports || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al resolver reporte' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await deleteReview(selectedReport.reviewId);
      setToast({ type: 'success', message: 'Reseña eliminada correctamente' });
      setConfirmDeleteOpen(false);
      // Reload reports
      const response = await fetchReviewReports({ page, limit: 15, status });
      setReports(response.data?.reports || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al eliminar reseña' });
    } finally {
      setActionLoading(false);
      setSelectedReport(null);
    }
  };

  const toggleExpanded = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (reportStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendiente',
      resolved: 'Resuelto',
      rejected: 'Rechazado'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[reportStatus] || 'bg-gray-100 text-gray-800'}`}>
        {labels[reportStatus] || reportStatus}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-4">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-conexia-green text-center sm:text-left">Reportes de Reseñas</h1>
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm font-semibold"
            onClick={() => router.push('/reports')}
          >
            Volver a Reportes
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 mx-4 md:mx-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto relative">
            <label className="text-sm text-conexia-green whitespace-nowrap">Estado:</label>
            <div className="relative w-full md:w-auto">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="h-9 border border-conexia-green rounded px-3 pr-8 text-sm text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full md:w-auto appearance-none bg-white"
              >
                {STATUS_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-conexia-green text-xl">
                <MdKeyboardArrowDown />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="bg-white rounded-xl shadow-sm mx-4 md:mx-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando reportes...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron reportes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reseña Reportada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reportado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {report.review?.reviewerUser?.name} {report.review?.reviewerUser?.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          En perfil de: {report.review?.reviewedUser?.name} {report.review?.reviewedUser?.lastName}
                        </div>
                        <div className="mt-1 text-gray-600">
                          {expandedReports.has(report.id) ? (
                            report.review?.description
                          ) : (
                            `${report.review?.description?.substring(0, 60)}...`
                          )}
                        </div>
                        <button
                          onClick={() => toggleExpanded(report.id)}
                          className="text-xs text-conexia-green hover:underline mt-1"
                        >
                          {expandedReports.has(report.id) ? 'Ver menos' : 'Ver más'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.reporter?.name} {report.reporter?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{report.reporter?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.reason}</div>
                      {report.description && (
                        <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.status === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            onClick={() => handleResolve(report.id, 'approve')}
                            disabled={actionLoading}
                            className="text-xs px-3 py-1"
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleResolve(report.id, 'reject')}
                            disabled={actionLoading}
                            className="text-xs px-3 py-1"
                          >
                            Rechazar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              setSelectedReport(report);
                              setConfirmDeleteOpen(true);
                            }}
                            disabled={actionLoading}
                            className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            Eliminar reseña
                          </Button>
                        </div>
                      )}
                      {report.status !== 'pending' && (
                        <span className="text-gray-400 text-xs">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {confirmDeleteOpen && (
        <ConfirmDeleteModal
          open={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setSelectedReport(null);
          }}
          onConfirm={handleDeleteReview}
          loading={actionLoading}
          title="¿Eliminar esta reseña?"
          message="Esta acción no se puede deshacer. La reseña será eliminada permanentemente del perfil del usuario."
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
    </div>
  );
}
