import { useState, useEffect } from 'react';
import { fetchServiceReportsDetail } from '@/service/reports/fetchServiceReportsDetail';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ServiceReportsDetailGrid({ serviceId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    fetchServiceReportsDetail(serviceId, page)
      .then(data => {
        setReports(data.reports || []);
        setPagination(data.pagination || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [serviceId, page]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-bold text-conexia-green mb-4">Reportes del servicio</h2>
      {loading ? (
        <p className="text-conexia-green">Cargando reportes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 italic">No se encontraron reportes para este servicio.</p>
      ) : (
        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Usuario reportante</th>
              <th className="p-3 text-left">Motivo</th>
              <th className="p-3 text-left">Descripción</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.reporter?.email || r.reporterId}</td>
                <td className="p-3">{r.reason}{r.otherReason ? ` (${r.otherReason})` : ''}</td>
                <td className="p-3">{r.description}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <Link href={`/admin/reports/service/${serviceId}/report/${r.id}`} className="text-conexia-green underline">Ver detalle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-between items-center mt-6">
        <Button disabled={!pagination.hasPrev} onClick={() => setPage(p => Math.max(1, p - 1))} variant="outline">Anterior</Button>
        <span>Página {pagination.page} de {pagination.totalPages}</span>
        <Button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)} variant="outline">Siguiente</Button>
      </div>
    </div>
  );
}
