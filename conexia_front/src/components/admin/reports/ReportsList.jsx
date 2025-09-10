"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchReportedProjects } from '@/service/reports/reportsFetch';
import { fetchReportedPublications } from '@/service/reports/publicationReportsFetch';
import { MdKeyboardArrowDown } from 'react-icons/md';
import Pagination from '@/components/common/Pagination';

const FILTERS = [
  { label: 'Proyectos', value: 'projects' },
  { label: 'Publicaciones', value: 'publications' },
  { label: 'Comentarios', value: 'comments', disabled: true },
  { label: 'Servicios', value: 'services', disabled: true },
];

const ORDER_OPTIONS = [
  { label: 'Cantidad de reportes', value: 'reportCount' },
  { label: 'Fecha de último reporte', value: 'lastReportDate' },
];

export default function ReportsList() {
  const [filter, setFilter] = useState('projects');
  const [order, setOrder] = useState('reportCount');
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (filter === 'projects') {
      fetchReportedProjects({ page, orderBy: order, pageSize: 15 })
        .then(data => {
          setProjects(data?.data?.projects || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        });
    } else if (filter === 'publications') {
      fetchReportedPublications({ page, orderBy: order, pageSize: 15 })
        .then(data => {
          setPublications(data?.data?.publications || []);
          setPagination(data?.data?.pagination || null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [filter, order, page]);

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-4">
  <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
        <h1 className="text-2xl font-bold text-conexia-green text-center">Reportes</h1>
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
          <table className="min-w-full table-auto text-sm mb-0">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
            <thead>
              <tr className="text-left border-b">
                <th className="p-4 min-w-[140px] md:min-w-[180px]">{filter === 'projects' ? 'Proyecto' : 'Publicación'}</th>
                <th className="p-4 min-w-[90px] max-w-[120px] text-center">Cantidad de reportes</th>
                <th className="p-4 min-w-[120px] max-w-[180px] text-center">Fecha de último reporte</th>
                <th className="p-4 min-w-[110px] max-w-[140px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
                </tr>
              ) : filter === 'projects' ? (
                projects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron proyectos reportados.</td>
                  </tr>
                ) : (
                  projects.map(p => (
                    <tr key={p.projectId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top">
                        <Link href={`/project/${p.projectId}?from=reports`} className="text-conexia-green font-semibold hover:underline break-all whitespace-normal">
                          {p.projectTitle}
                        </Link>
                      </td>
                      <td className="p-4 text-center align-middle">{p.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(p.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => window.location.href = `/reports/project/${p.projectId}`}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => window.location.href = `/project/${p.projectId}?from=reports`}
                          >
                            Ver proyecto
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                publications.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron publicaciones reportadas.</td>
                  </tr>
                ) : (
                  publications.map(pub => (
                    <tr key={pub.publicationId} className="border-b hover:bg-gray-50 h-auto align-top">
                      <td className="p-4 align-top">
                        <Link href={`/publication/${pub.publicationId}?from=reports`} className="text-conexia-green font-semibold hover:underline break-all whitespace-normal">
                          {pub.publicationTitle}
                        </Link>
                      </td>
                      <td className="p-4 text-center align-middle">{pub.reportCount}</td>
                      <td className="p-4 text-center align-middle">{new Date(pub.lastReportDate).toLocaleString()}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex justify-center gap-x-2">
                          <Button
                            variant="add"
                            className="px-3 py-1 text-xs"
                            onClick={() => window.location.href = `/reports/publication/${pub.publicationId}`}
                          >
                            Ver reportes
                          </Button>
                          <Button
                            variant="edit"
                            className="px-3 py-1 text-xs"
                            onClick={() => window.location.href = `/publication/${pub.publicationId}?from=reports`}
                          >
                            Ver publicación
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
          {pagination && (
            <div className="pt-4 pb-6 flex justify-center">
              <Pagination
                page={pagination.currentPage}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
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
