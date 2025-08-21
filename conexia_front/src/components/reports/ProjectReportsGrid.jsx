import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProjectReports } from '@/service/reports/reportsFetch';

export default function ProjectReportsGrid({ projectId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetchProjectReports(projectId, page)
      .then(data => {
        setReports(data?.data?.reports || []);
        setPagination(data?.data?.pagination || null);
        setLoading(false);
      });
  }, [projectId, page]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Reportes del proyecto</h2>
      {loading ? <div>Cargando...</div> : (
        <>
          <table className="w-full border rounded shadow mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Usuario reportante</th>
                <th className="p-2 text-left">Motivo</th>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.reporter?.email || r.reporterId}</td>
                  <td className="p-2">{r.reason}{r.reason === "Otro" && r.otherReason ? ` (${r.otherReason})` : ""}</td>
                  <td className="p-2">{r.description}</td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <a href={`/reports/detail/${r.id}`} className="text-conexia-green hover:underline">Ver detalle</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && (
            <div className="flex justify-center gap-2">
              <button
                className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage(page - 1)}
              >Anterior</button>
              <span className="px-3 py-1">Página {pagination.currentPage} de {pagination.totalPages}</span>
              <button
                className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
              >Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
