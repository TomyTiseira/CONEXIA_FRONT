"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchReportedProjects } from '@/service/reports/reportsFetch';

const FILTERS = [
  { label: 'Proyectos', value: 'projects' },
  { label: 'Publicaciones', value: 'posts', disabled: true },
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (filter !== 'projects') return;
    setLoading(true);
    fetchReportedProjects({ page, orderBy: order, pageSize: 15 })
      .then(data => {
        setProjects(data?.data?.projects || []);
        setPagination(data?.data?.pagination || null);
        setLoading(false);
      });
  }, [filter, order, page]);

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-4">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6">
        <h1 className="text-2xl font-bold text-conexia-green text-center">Reportes de proyectos</h1>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-conexia-green whitespace-nowrap">Tipo:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 border border-conexia-green rounded px-3 text-sm text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full md:w-auto">
              {FILTERS.map(f => (
                <option key={f.value} value={f.value} disabled={f.disabled}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-conexia-green whitespace-nowrap">Ordenar por:</label>
            <select value={order} onChange={e => setOrder(e.target.value)} className="h-9 border border-conexia-green rounded px-3 text-sm text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full md:w-auto">
              {ORDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-0 overflow-x-auto">
        <table className="min-w-full table-auto text-sm mb-0">
          <thead>
            <tr className="text-left border-b">
              <th className="p-4">Proyecto</th>
              <th className="p-4">Cantidad de reportes</th>
              <th className="p-4">Fecha de último reporte</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500 italic">No se encontraron proyectos reportados.</td>
              </tr>
            ) : (
              projects.map(p => (
                <tr key={p.projectId} className="border-b hover:bg-gray-50 h-[52px]">
                  <td className="p-4">
                    <Link href={`/reports/project/${p.projectId}`} className="text-conexia-green font-semibold hover:underline truncate max-w-[300px]">{p.projectTitle}</Link>
                  </td>
                  <td className="p-4">{p.reportCount}</td>
                  <td className="p-4">{new Date(p.lastReportDate).toLocaleString()}</td>
                  <td className="p-4 text-center align-middle">
                    {/* Aquí puedes agregar los botones de acción necesarios, por ejemplo: */}
                    <div className="flex justify-center gap-x-2">
                      <Button
                        variant="edit"
                        className="px-3 py-1 text-xs"
                        onClick={() => window.location.href = `/reports/project/${p.projectId}`}
                      >
                        Ver reportes
                      </Button>
                      <Button
                        variant="edit"
                        className="px-3 py-1 text-xs"
                        onClick={() => window.location.href = `/project/${p.projectId}`}
                      >
                        Ver proyecto
                      </Button>
                    </div>
                    {/* <button className="bg-conexia-coral text-white px-3 py-1 rounded font-semibold hover:bg-conexia-coral/90 transition">Eliminar</button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && (
          <div className="flex justify-center items-center gap-2 py-6">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage(page - 1)}
            >
              &#8592;
            </button>
            <span className="bg-conexia-green text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
              {pagination.currentPage}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(page + 1)}
            >
              &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
