'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getServiceReviewsWithReports } from '@/service/reports/serviceReviewReports';
import { Flag, ChevronDown, ChevronUp, AlertTriangle, Star } from 'lucide-react';

export default function ServiceReviewReportsList() {
  const router = useRouter();
  const [serviceReviews, setServiceReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [orderBy, setOrderBy] = useState('reportCount');

  useEffect(() => {
    loadServiceReviewReports();
  }, [pagination.page, orderBy]);

  const loadServiceReviewReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceReviewsWithReports({
        page: pagination.page,
        limit: pagination.limit,
        orderBy
      });
      
      setServiceReviews(data.serviceReviews || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      console.error('Error loading service review reports:', err);
      setError(err.message || 'Error al cargar los reportes de reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (serviceReviewId) => {
    router.push(`/reports/service-review/${serviceReviewId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportCountColor = (count) => {
    if (count >= 10) return 'bg-red-100 text-red-800 border-red-300';
    if (count >= 5) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (loading && serviceReviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-700 font-semibold mb-2">Error al cargar reportes</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadServiceReviewReports}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Flag className="text-orange-600" size={24} />
            Reseñas de Servicios Reportadas
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {pagination.total} reseñas reportadas
          </p>
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            value={orderBy}
            onChange={(e) => {
              setOrderBy(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50"
          >
            <option value="reportCount">Cantidad de reportes</option>
            <option value="lastReportDate">Fecha del último reporte</option>
          </select>
        </div>
      </div>

      {/* Lista de reseñas reportadas */}
      {serviceReviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Flag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay reseñas reportadas
          </h3>
          <p className="text-gray-500">
            Cuando los usuarios reporten reseñas de servicios, aparecerán aquí para revisión.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {serviceReviews.map((review) => (
            <div
              key={review.serviceReviewId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex justify-between items-start gap-4">
                  {/* Información de la reseña */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        {/* Badge de cantidad de reportes */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getReportCountColor(review.reportCount)}`}>
                            <Flag size={16} />
                            {review.reportCount} {review.reportCount === 1 ? 'reporte' : 'reportes'}
                          </span>
                          {/* Calificación */}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Usuario que hizo la reseña */}
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold text-gray-800">Autor de la reseña:</span>{' '}
                          {review.reviewerUser?.name} {review.reviewerUser?.lastName}
                          <span className="text-gray-400 ml-2">({review.reviewerUser?.email})</span>
                        </div>

                        {/* Dueño del servicio */}
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-semibold text-gray-800">Dueño del servicio:</span>{' '}
                          {review.serviceOwnerUser?.name} {review.serviceOwnerUser?.lastName}
                          <span className="text-gray-400 ml-2">({review.serviceOwnerUser?.email})</span>
                        </div>

                        {/* Comentario de la reseña */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                          <p className="text-sm text-gray-700 italic line-clamp-3">
                            "{review.comment}"
                          </p>
                        </div>

                        {/* Fechas */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>
                            <span className="font-medium">Reseña creada:</span> {formatDate(review.reviewCreatedAt)}
                          </span>
                          <span>
                            <span className="font-medium">Último reporte:</span> {formatDate(review.lastReportDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => handleViewDetails(review.serviceReviewId)}
                    className="flex-shrink-0 px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    Ver detalles
                    <ChevronDown size={16} className="rotate-[-90deg]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
