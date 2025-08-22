"use client";
import Button from "@/components/ui/Button";
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
    <div className="max-w-6xl mx-auto pt-8 pb-4">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6">
        <h2 className="text-2xl font-bold text-conexia-green text-center block">Reportes del proyecto</h2>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Button
            variant="add"
            onClick={() => window.location.href = `/project/${projectId}`}
          >
            Ver proyecto
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-0 overflow-x-auto">
        <table className="min-w-full table-auto text-sm mb-0">
          <thead>
            <tr className="text-left border-b">
              <th className="p-4">ID</th>
              <th className="p-4">Usuario reportante</th>
              <th className="p-4">Motivo</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Fecha</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500 italic">No se encontraron reportes para este proyecto.</td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 h-[52px]">
                  <td className="p-4">{r.id}</td>
                  <td className="p-4">{r.reporter?.email || r.reporterId}</td>
                  <td className="p-4">{r.reason}{r.reason === "Otro" && r.otherReason ? ` (${r.otherReason})` : ""}</td>
                  <td className="p-4">{r.description}</td>
                  <td className="p-4">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-center align-middle">
                    <a href={`/reports/detail/${r.id}`} className="text-conexia-green hover:underline">Ver detalle</a>
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
