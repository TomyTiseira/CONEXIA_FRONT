"use client";

import { useRouter } from "next/navigation";
import { openFileInNewTab } from "@/utils/fileUtils";

export default function PostulationsTable({
  postulations,
  onEvaluate,
  isLoading,
}) {
  const router = useRouter();

  const handleDownloadCV = (cvUrl) => {
    openFileInNewTab(cvUrl);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";

    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return "Fecha inválida";

      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error en fecha";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.code) {
      case "activo":
        return "bg-blue-100 text-blue-800";
      case "aceptada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      case "cancelada":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-conexia-green">
        Cargando postulaciones...
      </div>
    );
  }

  if (postulations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg mb-2">No se encontraron postulaciones</p>
        <p className="text-sm">
          Este proyecto aún no tiene postulaciones o no hay postulaciones que
          coincidan con el filtro seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Vista de escritorio */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Postulante
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de postulación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CV
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {postulations.map((postulation) => (
            <tr key={postulation.id} className="hover:bg-gray-50">
              {/* Postulante */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() =>
                    router.push(`/profile/userProfile/${postulation.userId}`)
                  }
                  className="text-conexia-green font-medium hover:underline focus:outline-none"
                >
                  {postulation.applicantName || "Usuario sin nombre"}
                </button>
              </td>

              {/* Rol */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {postulation.roleName || "Rol no especificado"}
              </td>

              {/* Fecha de postulación */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {postulation.createdAt
                  ? formatDate(postulation.createdAt)
                  : "Fecha no disponible"}
              </td>

              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(postulation.status)}`}
                >
                  {postulation.status?.name || "Sin estado"}
                </span>
              </td>

              {/* CV */}
              <td className="px-6 py-4 whitespace-nowrap">
                {postulation.cvUrl ? (
                  <button
                    onClick={() => handleDownloadCV(postulation.cvUrl)}
                    className="text-conexia-green hover:text-conexia-green/80 text-sm font-medium hover:underline"
                  >
                    Descargar CV
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Sin CV</span>
                )}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap">
                {postulation.status?.code === "activo" ? (
                  <button
                    onClick={() => onEvaluate(postulation)}
                    className="bg-conexia-green text-white px-3 py-1 rounded text-sm font-medium hover:bg-conexia-green/90 transition"
                  >
                    Evaluar
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Vista móvil */}
      <div className="md:hidden space-y-4">
        {postulations.map((postulation) => (
          <div
            key={postulation.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Header con nombre y estado */}
            <div className="flex justify-between items-start mb-3">
              <button
                onClick={() =>
                  router.push(`/profile/userProfile/${postulation.userId}`)
                }
                className="text-conexia-green font-medium hover:underline focus:outline-none text-left"
              >
                {postulation.applicantName || "Usuario"}
              </button>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(postulation.status)}`}
              >
                {postulation.status?.name || "Sin estado"}
              </span>
            </div>

            {/* Información adicional */}
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Rol:</span>{" "}
                {postulation.roleName || "Rol no especificado"}
              </div>
              <div>
                <span className="font-medium">Fecha:</span>{" "}
                {formatDate(postulation.createdAt)}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 justify-between items-center">
              <div>
                {postulation.cvUrl ? (
                  <button
                    onClick={() => handleDownloadCV(postulation.cvUrl)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
                  >
                    Descargar CV
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Sin CV</span>
                )}
              </div>

              {postulation.status?.code === "activo" && (
                <button
                  onClick={() => onEvaluate(postulation)}
                  className="bg-conexia-green text-white px-3 py-1 rounded text-sm font-medium hover:bg-conexia-green/90 transition"
                >
                  Evaluar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
