"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchReportedProjects } from '@/service/reports/reportsFetch';
import { fetchReportedPublications } from '@/service/reports/publicationReportsFetch';
import { fetchReportedServices } from '@/service/reports/fetchReportedServices';
import { fetchReportedReviews } from '@/service/reports/reviewReportsFetch';
import { fetchReportedComments } from '@/service/reports/commentReportsFetch';
import { fetchReportedServiceReviews } from '@/service/reports/fetchReportedServiceReviews';
import { MdKeyboardArrowDown } from 'react-icons/md';
import Pagination from '@/components/common/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';

const FILTERS = [
  { label: 'Proyectos', value: 'projects' },
  { label: 'Publicaciones', value: 'publications' },
  { label: 'Comentarios', value: 'comments' },
  { label: 'Servicios', value: 'services'},
  { label: 'Reseñas de Usuarios', value: 'reviews'},
  { label: 'Reseñas de Servicios', value: 'service-reviews'},
];

const ORDER_OPTIONS = [
  { label: 'Cantidad de reportes', value: 'reportCount' },
  { label: 'Fecha de último reporte', value: 'lastReportDate' },
];

export default function ReportsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Obtener rol actual del usuario desde el store
  const { roleName } = useUserStore();
  const [filter, setFilter] = useState('projects');
  const [order, setOrder] = useState('reportCount');
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [comments, setComments] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const validFilters = useMemo(() => new Set(FILTERS.filter(f => !f.disabled).map(f => f.value)), []);
  const validOrders = useMemo(() => new Set(ORDER_OPTIONS.map(o => o.value)), []);

  // Initialize state from URL on first render
  useEffect(() => {
    if (!searchParams) return;
    const qFilter = searchParams.get('filter');
    const qOrder = searchParams.get('order');
    const qPageRaw = searchParams.get('page');
    const qPage = qPageRaw ? parseInt(qPageRaw, 10) : 1;
    if (qFilter && validFilters.has(qFilter)) setFilter(qFilter);
    if (qOrder && validOrders.has(qOrder)) setOrder(qOrder);
    if (!Number.isNaN(qPage) && qPage > 0) setPage(qPage);
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    // Clear stale pagination while loading a different dataset
    setPagination(null);
    // Optional: clear lists for non-active filters to avoid flicker
    // (We keep the active list so table content doesn't jump unnecessarily.)
    if (filter === 'projects') {
      fetchReportedProjects({ page, orderBy: order, pageSize: 15 })
        .then(data => {
          setProjects(data?.data?.projects || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        });
    } else if (filter === 'publications') {
      fetchReportedPublications({ page, orderBy: order, limit: 15 })
        .then(data => {
          setPublications(data?.data?.publications || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        });
    } else if (filter === 'comments') {
      fetchReportedComments({ page, orderBy: order, limit: 15 })
        .then(data => {
          setComments(data?.data?.comments || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (filter === 'services') {
      fetchReportedServices({ page, orderBy: order })
        .then(data => {
          setServices(data?.services || []);
          setPagination(data?.pagination || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (filter === 'reviews') {
      fetchReportedReviews({ page, orderBy: order })
        .then(data => {
          setReviews(data?.data?.userReviews || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (filter === 'service-reviews') {
      fetchReportedServiceReviews({ page, orderBy: order, limit: 15 })
        .then(data => {
          setServiceReviews(data?.serviceReviews || []);
          setPagination(data?.pagination || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [filter, order, page, initialized]);

  // Sync current selection to URL for better back-navigation
  useEffect(() => {
    if (!initialized) return; // avoid overwriting URL before initial read
    const params = new URLSearchParams();
    params.set('filter', filter);
    params.set('order', order);
    params.set('page', String(page));
    router.replace(`/reports?${params.toString()}`, { scroll: false });
  }, [filter, order, page, router, initialized]);

  // Reset page when filter changes via UI to start from first page of each dataset
  useEffect(() => {
    if (!initialized) return;
    // When user switches filter, go to page 1 for the new dataset
    setPage(1);
  }, [filter]);

  return (
      <div className="max-w-6xl mx-auto pt-8 pb-4">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-conexia-green text-center sm:text-left">Reportes</h1>
            {/* Botón acceso a moderación IA */}
            {(roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) && (
              <Button
                variant="primary"
                className="px-5 py-2 text-sm font-semibold"
                onClick={() => router.push('/admin/moderation')}
              >
                Panel de Moderación IA
              </Button>
            )}
          </div>
        </div>
  <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 mx-4 md:mx-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          {/* Filtro tipo de reporte */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto relative">
            <label className="text-sm text-conexia-green whitespace-nowrap">Tipo de reporte:</label>
            <div className="relative w-full md:w-auto">
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="h-9 border border-conexia-green rounded px-3 pr-8 text-sm text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full md:w-auto appearance-none bg-white">
                {FILTERS.map(f => (
                  <option key={f.value} value={f.value} disabled={f.disabled}>{f.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-conexia-green text-xl">
                <MdKeyboardArrowDown />
              </span>
            </div>
          </div>
          {/* Filtro ordenar por */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto relative">
            <label className="text-sm text-conexia-green whitespace-nowrap">Ordenar por:</label>
            <div className="relative w-full md:w-auto">
              <select value={order} onChange={e => setOrder(e.target.value)}
                className="h-9 border border-conexia-green rounded px-3 pr-8 text-sm text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full md:w-auto appearance-none bg-white">
                {ORDER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-conexia-green text-xl">
                <MdKeyboardArrowDown />
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Tabla con márgenes y fondo celeste en mobile, paginado reutilizable */}
      <div className="relative">
        <div className="bg-white rounded-xl shadow-sm border p-0 overflow-x-auto mx-4 md:mx-0" style={{ zIndex: 1, position: 'relative' }}>
          <table className="w-full table-fixed text-sm mb-0">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
            <thead>
              <tr className="text-left border-b">
                <th className="p-4 min-w-[140px] md:min-w-[180px]">
                  {filter === 'projects' ? 'Proyecto' : 
                   filter === 'services' ? 'Servicio' : 
                   filter === 'reviews' ? 'Reseña de usuarios ' :
                   filter === 'service-reviews' ? 'Reseña de servicio':
                   filter === 'comments' ? 'Comentario' : 
                   'Publicación'}
                </th>
                <th className="p-4 min-w-[90px] max-w-[120px] text-center">Cantidad de reportes</th>
                <th className="p-4 min-w-[120px] max-w-[180px] text-center">Fecha de último reporte</th>
                <th className="p-4 min-w-[110px] max-w-[140px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading">
                  <td colSpan="4" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
                </tr>
              ) : filter === 'projects' ? (
                projects.length === 0 ? (
                  <tr key="no-projects">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron proyectos reportados.</td>
                  </tr>
                ) : (
                  projects.map(p => (
                    <tr key={p.projectId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                        <Link href={`/project/${p.projectId}?from=reports`} className="text-conexia-green font-semibold hover:underline block">
                          <div className="line-clamp-2 break-words overflow-hidden text-ellipsis" title={p.projectTitle}>
                            {p.projectTitle}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-center align-middle">{p.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(p.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/project/${p.projectId}?filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/project/${p.projectId}?from=reports`)}
                          >
                            Ver proyecto
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : filter === 'publications' ? (
                publications.length === 0 ? (
                  <tr key="no-publications">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron publicaciones reportadas.</td>
                  </tr>
                ) : (
                  publications.map(pub => (
                    <tr key={pub.publicationId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                        <Link href={`/publication/${pub.publicationId}?from=reports`} className="text-conexia-green font-semibold hover:underline block">
                          <div className="line-clamp-2 break-words overflow-hidden text-ellipsis" title={pub.publicationTitle}>
                            {pub.publicationTitle}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-center align-middle">{pub.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(pub.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/publication/${pub.publicationId}?filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/publication/${pub.publicationId}?from=reports`)}
                          >
                            Ver publicación
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : filter === 'comments' ? (
                comments.length === 0 ? (
                  <tr key="no-comments">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron comentarios reportados.</td>
                  </tr>
                ) : (
                  comments.map(comment => (
                    <tr key={comment.commentId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                        <div className="text-conexia-green font-semibold line-clamp-2 break-words overflow-hidden text-ellipsis" title={comment.commentContent}>
                          {comment.commentContent || 'Sin contenido'}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">{comment.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(comment.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/comment/${comment.commentId}?filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => {
                              if (comment.publicationId) {
                                router.push(`/publication/${comment.publicationId}?from=reports&fromReportsPublicationId=${comment.publicationId}&commentId=${comment.commentId}`);
                              }
                            }}
                            disabled={!comment.publicationId}
                          >
                            Ver comentario
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : filter === 'services' ? (
                services.length === 0 ? (
                  <tr key="no-services">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron servicios reportados.</td>
                  </tr>
                ) : (
                  services.map(s => (
                    <tr key={s.serviceId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                          <Link href={`/services/${s.serviceId}?from=reports&filter=${filter}&order=${order}&page=${page}`} className="text-conexia-green font-semibold hover:underline block">
                          <div className="line-clamp-2 break-words overflow-hidden text-ellipsis" title={s.serviceTitle}>
                            {s.serviceTitle}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-center align-middle">{s.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(s.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/service/${s.serviceId}?filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/services/${s.serviceId}?from=reports&filter=${filter}&order=${order}&page=${page}`)}
                          >
                            Ver servicio
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : filter === 'reviews' ? (
                reviews.length === 0 ? (
                  <tr key="no-reviews">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron reseñas reportadas.</td>
                  </tr>
                ) : (
                  reviews.map(review => {
                    console.log('Review object:', review);
                    return (
                    <tr key={`review-${review.id || review.userReviewId}`} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                        <div className="text-conexia-green font-semibold">
                          <div className="line-clamp-2 break-words overflow-hidden text-ellipsis text-sm" title={review.description}>
                            {review.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">{review.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(review.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/review?reviewId=${review.id || review.userReviewId}&filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/profile/${review.reviewedUser?.id}/reviews?highlightReviewId=${review.id || review.userReviewId}`)}
                          >
                            Ver reseña
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )})
                )
              ) : filter === 'service-reviews' ? (
                serviceReviews.length === 0 ? (
                  <tr key="no-service-reviews">
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron reseñas de servicios reportadas.</td>
                  </tr>
                ) : (
                  serviceReviews.map(review => (
                    <tr key={`service-review-${review.serviceReviewId}`} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top max-w-[300px]">
                        <div className="text-conexia-green font-semibold">
                          <div className="line-clamp-2 break-words overflow-hidden text-ellipsis text-sm" title={review.comment}>
                            {review.comment}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">{review.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(review.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/reports/service-review/${review.serviceReviewId}?filter=${filter}&order=${order}&returnPage=${page}`)}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => router.push(`/services/${review.serviceId}?from=reports-service-review&highlightReviewId=${review.serviceReviewId}&fromReportsServiceReviewId=${review.serviceReviewId}`)}
                          >
                            Ver reseña
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr key="no-filter-selected">
                  <td colSpan="4" className="p-6 text-center text-gray-500 italic">Selecciona un tipo de reporte.</td>
                </tr>
              )}
            </tbody>
          </table>
          {pagination && (
            <div className="pt-4 pb-6 flex justify-center">
              <Pagination
                page={(pagination?.currentPage ?? pagination?.page) || page}
                currentPage={pagination?.currentPage ?? pagination?.page}
                hasNextPage={pagination?.hasNextPage ?? pagination?.hasNext}
                hasPreviousPage={pagination?.hasPreviousPage ?? pagination?.hasPrev}
                totalPages={pagination?.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
        {/* Espacio celeste y márgenes en mobile */}
        <div className="block md:hidden w-full absolute left-0 right-0" style={{ background: '#eaf6f4', height: 56, bottom: -56, zIndex: 0 }}></div>
      </div>
    </div>
  );
}
