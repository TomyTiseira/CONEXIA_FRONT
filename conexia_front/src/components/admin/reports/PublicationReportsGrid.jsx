"use client";
import Button from "@/components/ui/Button";
import Pagination from '@/components/common/Pagination';
import BackButton from '@/components/ui/BackButton';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPublicationReports } from '@/service/reports/publicationReportsFetch';

export default function PublicationReportsGrid({ publicationId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  useEffect(() => {
    if (!publicationId) return;
    setLoading(true);
    fetchPublicationReports(publicationId, page)
      .then(data => {
        setReports(data?.data?.reports || []);
        setPagination(data?.data?.pagination || null);
        setLoading(false);
      });
  }, [publicationId, page]);

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-24">
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative mb-6 mx-4 md:mx-0">
        <h2 className="text-2xl font-bold text-conexia-green text-center">Reportes de la publicación</h2>
        {/* Botón en desktop a la derecha */}
        <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={() => window.location.href = `/publication/${publicationId}?from=reports-publication&fromReportsPublicationId=${publicationId}`}
          >
            Ver publicación
          </Button>
        </div>
        {/* Botón en mobile abajo */}
        <div className="sm:hidden mt-4 flex justify-center">
          <Button
            variant="add"
            className="px-4 py-2 text-sm"
            onClick={() => window.location.href = `/publication/${publicationId}?from=reports-publication&fromReportsPublicationId=${publicationId}`}
          >
            Ver publicación
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-0 overflow-x-auto mx-4 md:mx-0">
        <table className="min-w-full table-auto text-sm mb-0">
          <colgroup><col className="w-[60px] md:w-[60px]" /><col className="w-[160px] md:w-[180px]" /><col className="w-[120px] md:w-[160px]" /><col className="w-[180px] md:w-[320px]" /><col className="w-[120px] md:w-[160px]" /></colgroup>
          <thead>
            <tr className="border-b">
              <th className="p-4 min-w-[40px] max-w-[60px] text-left">ID</th>
              <th className="p-4 min-w-[120px] max-w-[180px] text-left">Usuario reportante</th>
              <th className="p-4 min-w-[80px] max-w-[160px] text-left">Motivo</th>
              <th className="p-4 min-w-[120px] max-w-[320px] text-left">Descripción</th>
              <th className="p-4 min-w-[90px] max-w-[160px] text-center">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-conexia-green">Cargando reportes...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500 italic">No se encontraron reportes para esta publicación.</td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 h-auto align-top">
                  <td className="p-4 align-top break-words max-w-[60px] text-left">{r.id}</td>
                  <td className="p-4 align-top break-words max-w-[180px] text-left">{r.reporter?.email || r.reporterId}</td>
                  <td className="p-4 align-top break-words max-w-[160px] text-left">{r.reason}{r.reason === "Otro" && r.otherReason ? ` (${r.otherReason})` : ""}</td>
                  <td className="p-4 align-top break-words max-w-[320px] text-left">
                    <div className="line-clamp-4 overflow-hidden" title={r.description}>
                      {r.description}
                    </div>
                  </td>
                  <td className="p-4 align-top break-words max-w-[160px] whitespace-nowrap text-center">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && (
          <div className="pt-4 pb-6 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              page={pagination.currentPage}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      {/* Botón volver atrás debajo de la tabla */}
      <div className="mx-4 md:mx-0 mt-4">
        <BackButton text="Volver a los reportes" onClick={() => window.location.href = '/reports'} />
      </div>
    </div>
  );
}
