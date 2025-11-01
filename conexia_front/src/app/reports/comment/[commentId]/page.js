'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchCommentReports } from '@/service/reports/commentReportsFetch';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Button from '@/components/ui/Button';
import Pagination from '@/components/common/Pagination';

export default function CommentReportsPage() {
  const params = useParams();
  const router = useRouter();
  const { roleName } = useUserStore();
  const commentId = params?.commentId;

  const [reports, setReports] = useState([]);
  const [commentData, setCommentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Verificar permisos
  useEffect(() => {
    if (roleName && roleName !== ROLES.ADMIN && roleName !== ROLES.MODERATOR) {
      router.push('/');
    }
  }, [roleName, router]);

  // Cargar reportes del comentario
  useEffect(() => {
    if (!commentId || !roleName) return;
    if (roleName !== ROLES.ADMIN && roleName !== ROLES.MODERATOR) return;

    setLoading(true);
    setError(null);

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
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar reportes del comentario:', err);
        setError(err.message || 'Error al cargar los reportes');
        setLoading(false);
      });
  }, [commentId, page, roleName]);

  if (!roleName || (roleName !== ROLES.ADMIN && roleName !== ROLES.MODERATOR)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#eaf6f4] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/reports')}
              className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#e0f0f0] rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="font-medium">Atrás</span>
            </button>
            <h1 className="text-2xl font-bold text-conexia-green">
              Reportes del Comentario
            </h1>
          </div>
        </div>

        {/* Información del comentario */}
        {commentData && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-conexia-green mb-4">
              Información del Comentario
            </h2>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Contenido:</span>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {commentData.content || 'Sin contenido'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Fecha de creación:</span>
                <span className="text-sm text-gray-600">
                  {commentData.createdAt
                    ? new Date(commentData.createdAt).toLocaleString()
                    : 'Desconocida'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Estado:</span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                    commentData.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {commentData.isActive ? 'Activo' : 'Eliminado'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lista de reportes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-conexia-green">
              Reportes Recibidos
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-conexia-green">
              Cargando reportes...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error: {error}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">
              No se encontraron reportes para este comentario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left min-w-[150px]">Usuario que reportó</th>
                    <th className="p-4 text-left min-w-[180px]">Motivo</th>
                    <th className="p-4 text-left min-w-[250px]">Descripción</th>
                    <th className="p-4 text-center min-w-[150px]">Fecha del reporte</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id || index} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="text-conexia-green font-medium">
                          {report.reporterName || 'Usuario desconocido'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700 font-medium">
                          {report.reason}
                        </span>
                        {report.reason === 'Otro' && report.otherReason && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({report.otherReason})
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {report.description}
                        </p>
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-6 flex justify-center border-t">
              <Pagination
                page={pagination.currentPage || page}
                currentPage={pagination.currentPage}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        {/* Acciones del moderador */}
        {commentData && (
          <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-conexia-green mb-4">
              Acciones de Moderación
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                variant="edit"
                onClick={() => {
                  if (commentData.publicationId) {
                    // Añadimos flag de origen para mantener consistencia con la navegación desde reportes
                    router.push(`/publication/${commentData.publicationId}?from=reports&fromReportsPublicationId=${commentData.publicationId}&commentId=${commentId}`);
                  }
                }}
                disabled={!commentData.publicationId}
              >
                Ver Comentario en Publicación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
