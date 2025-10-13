import { useState, useEffect } from 'react';
import { fetchReportedServices } from '@/service/reports/fetchReportedServices';
import Button from '@/components/ui/Button';

export default function ServiceReportsGrid() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState('reportCount');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    fetchReportedServices({ page, orderBy })
      .then(data => {
        setServices(data.services || []);
        setPagination(data.pagination || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, orderBy]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-conexia-green mb-4">Servicios reportados</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="font-medium">Ordenar por:</label>
        <select value={orderBy} onChange={e => setOrderBy(e.target.value)} className="border rounded px-2 py-1">
          <option value="reportCount">Cantidad de reportes</option>
          <option value="lastReportDate">Fecha último reporte</option>
        </select>
      </div>
      {loading ? (
        <p className="text-conexia-green">Cargando servicios reportados...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500 italic">No se encontraron servicios reportados.</p>
      ) : (
        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Título</th>
              <th className="p-3 text-left">Cantidad de reportes</th>
              <th className="p-3 text-left">Fecha último reporte</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.serviceId} className="border-b">
                <td className="p-3">{s.serviceId}</td>
                <td className="p-3">{s.serviceTitle}</td>
                <td className="p-3">{s.reportCount}</td>
                <td className="p-3">{new Date(s.lastReportDate).toLocaleString()}</td>
                <td className="p-3">{s.status === 'active' ? 'Activo' : 'Baja'}</td>
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
