'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getServiceReviewReports } from '@/service/reports/serviceReviewReports';
import { getServiceReviews } from '@/service/serviceReviews';
import { ArrowLeft, Flag, AlertTriangle, User, Calendar, FileText, Star } from 'lucide-react';

export default function ServiceReviewReportsDetail({ serviceReviewId }) {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [reviewData, setReviewData] = useState(null);
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

  useEffect(() => {
    loadReports();
    loadReviewData();
  }, [serviceReviewId, pagination.page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceReviewReports(serviceReviewId, {
        page: pagination.page,
        limit: pagination.limit
      });
      
      setReports(data.reports || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewData = async () => {
    try {
      // Necesitamos obtener el serviceId de la reseña para poder cargarla
      // Por ahora, asumimos que lo tendremos en el primer reporte
      // En un caso real, deberías obtener esta información del backend
    } catch (err) {
      console.error('Error loading review data:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonColor = (reason) => {
    const colors = {
      'Contenido ofensivo o inapropiado': 'bg-red-100 text-red-800 border-red-300',
      'Spam o contenido irrelevante': 'bg-orange-100 text-orange-800 border-orange-300',
      'Reseña falsa o fraudulenta': 'bg-purple-100 text-purple-800 border-purple-300',
      'Información personal sensible': 'bg-blue-100 text-blue-800 border-blue-300',
      'Otro': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[reason] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading && reports.length === 0) {
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
          onClick={loadReports}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Flag className="text-orange-600" size={28} />
            Reportes de Reseña #{serviceReviewId}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Total de reportes: {pagination.total}
          </p>
        </div>
      </div>

      {/* Información de la reseña reportada */}
      {reports.length > 0 && reports[0] && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-conexia-green" />
            Reseña Reportada
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Columna izquierda: Información del autor */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Autor de la reseña:</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-medium text-gray-800">
                    {reports[0].reviewer?.name} {reports[0].reviewer?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{reports[0].reviewer?.email}</p>
                </div>
              </div>

              {/* Calificación */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Calificación:</h3>
                <div className="flex items-center gap-1">
                  {/* Las estrellas se mostrarán cuando obtengamos los datos completos */}
                  <span className="text-sm text-gray-600">Ver en el servicio</span>
                </div>
              </div>
            </div>

            {/* Columna derecha: Fechas */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de creación:</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    {formatDate(reports[0].createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para ver el servicio completo */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Para ver el contenido completo de la reseña y tomar acciones, visita la página del servicio.
            </p>
            <button
              onClick={() => {
                // Aquí podrías redirigir al servicio con la reseña marcada
                // Por ahora, solo mostramos un mensaje
                alert('Funcionalidad para navegar al servicio en desarrollo');
              }}
              className="px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors text-sm font-medium"
            >
              Ver Servicio y Reseña Completa
            </button>
          </div>
        </div>
      )}

      {/* Lista de reportes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Reportes Recibidos</h2>
        
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Flag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No se encontraron reportes
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
              >
                {/* Header del reporte */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {report.reporter?.name} {report.reporter?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{report.reporter?.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(report.createdAt)}
                  </p>
                </div>

                {/* Motivo del reporte */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getReasonColor(report.reason)}`}>
                    {report.reason}
                  </span>
                  {report.otherReason && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Motivo específico:</span> {report.otherReason}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Descripción del reporte:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{report.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
