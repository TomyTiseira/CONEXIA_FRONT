'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de tabla para mostrar reportes clasificados
 * @param {Array} reports - Lista de reportes a mostrar
 * @param {string} type - Tipo de reporte (services, projects, publications)
 */
export default function ReportsTable({ reports = [], type = 'services' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDescription, setExpandedDescription] = useState(null);
  const itemsPerPage = 10;

  // Calcular paginación
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setExpandedDescription(null);
  };

  // Toggle descripción expandida
  const toggleDescription = (reportId) => {
    setExpandedDescription(expandedDescription === reportId ? null : reportId);
  };

  // Formatear razón del reporte
  const formatReason = (reason, otherReason) => {
    if (reason === 'Otro' && otherReason) {
      return `Otro: ${otherReason}`;
    }
    return reason;
  };

  // Obtener el ID del recurso según el tipo
  const getResourceId = (report) => {
    if (type === 'services') return report.serviceId;
    if (type === 'projects') return report.projectId;
    if (type === 'publications') return report.publicationId;
    return null;
  };

  // Truncar texto
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">
          No hay reportes de {type === 'services' ? 'servicios' : type === 'projects' ? 'proyectos' : 'publicaciones'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurso
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  #{report.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <p className="font-medium text-conexia-green">
                      {report.resourceTitle || `${type === 'services' ? 'Servicio' : type === 'projects' ? 'Proyecto' : 'Publicación'} #${getResourceId(report)}`}
                    </p>
                    {report.resourceDescription && (
                      <p className="text-xs text-gray-500">
                        {truncateText(report.resourceDescription, 40)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {formatReason(report.reason, report.otherReason)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                  <div>
                    <p className={expandedDescription === report.id ? '' : 'line-clamp-2'}>
                      {report.description || '-'}
                    </p>
                    {report.description && report.description.length > 60 && (
                      <button
                        onClick={() => toggleDescription(report.id)}
                        className="text-conexia-green text-xs hover:underline mt-1"
                      >
                        {expandedDescription === report.id ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {format(new Date(report.createdAt), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {report.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-3">
        {currentReports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-gray-500">#{report.id}</span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  report.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {report.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Recurso</p>
              <p className="font-medium text-conexia-green text-sm">
                {report.resourceTitle || `${type === 'services' ? 'Servicio' : type === 'projects' ? 'Proyecto' : 'Publicación'} #${getResourceId(report)}`}
              </p>
              {report.resourceDescription && (
                <p className="text-xs text-gray-500 mt-1">
                  {truncateText(report.resourceDescription, 60)}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Razón</p>
              <p className="text-sm text-gray-700">
                {formatReason(report.reason, report.otherReason)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Descripción</p>
              <div>
                <p className={`text-sm text-gray-700 ${expandedDescription === report.id ? '' : 'line-clamp-2'}`}>
                  {report.description || '-'}
                </p>
                {report.description && report.description.length > 60 && (
                  <button
                    onClick={() => toggleDescription(report.id)}
                    className="text-conexia-green text-xs hover:underline mt-1"
                  >
                    {expandedDescription === report.id ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {format(new Date(report.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(endIndex, reports.length)}</span> de{' '}
                <span className="font-medium">{reports.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Paginación">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? 'z-10 bg-conexia-green text-white focus:z-20'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
