"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="flex gap-4 mb-6">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-3 py-2">
          {FILTERS.map(f => (
            <option key={f.value} value={f.value} disabled={f.disabled}>{f.label}</option>
          ))}
        </select>
        <select value={order} onChange={e => setOrder(e.target.value)} className="border rounded px-3 py-2">
          {ORDER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-conexia-green">Cargando reportes...</div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 italic">No se encontraron proyectos reportados.</div>
        ) : (
          <table className="min-w-full table-auto text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Proyecto</th>
                <th className="p-2">Cantidad de reportes</th>
                <th className="p-2">Fecha de último reporte</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.projectId} className="border-b hover:bg-gray-50 h-[52px]">
                  <td className="p-2">
                    <Link href={`/reports/project/${p.projectId}`} className="text-conexia-green font-semibold hover:underline truncate max-w-[300px]">{p.projectTitle}</Link>
                  </td>
                  <td className="p-2">{p.reportCount}</td>
                  <td className="p-2">{new Date(p.lastReportDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination && (
          <div className="flex justify-center items-center gap-2 mt-6">
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
