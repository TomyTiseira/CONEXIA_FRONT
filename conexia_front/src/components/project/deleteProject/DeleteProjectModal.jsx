"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { deleteProjectById } from "@/service/projects/projectsFetch"; // Corregido: projectsFetch en plural
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export default function DeleteProjectModal({ projectId, onCancel, onProjectDeleted, loading }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setMsg(null);
    if (!motivo.trim()) {
      setError("El motivo de baja es obligatorio.");
      return;
    }

    try {
      await deleteProjectById(projectId, motivo); // Usar 'motivo' como 'reason'

      setMsg({ ok: true, text: "Proyecto dado de baja exitosamente." });

      setTimeout(() => {
        // Redirigir, actualizar UI o llamar callback
        onProjectDeleted?.();
        
        // Redirigir según el rol del usuario
        if (user?.id) {
          // Si es admin o moderador, redirigir a la búsqueda de proyectos
          if (user.role === "admin" || user.role === "moderator") {
            router.push("/project");
          } else {
            // Si es el dueño, redirigir a sus proyectos
            router.push(`/projects/user/${user.id}`);
          }
        } else {
          router.push("/project"); // Fallback a la página principal de proyectos
        }
      }, 1000);
    } catch (err) {
      console.error("Error al eliminar proyecto:", err);
      setMsg({ ok: false, text: err.message || "Error al dar de baja el proyecto." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Confirmar eliminación de proyecto
        </h2>
        <p className="text-sm text-conexia-green text-center mb-4 whitespace-normal md:whitespace-nowrap">
          ¿Estás seguro que deseas dar de baja este proyecto?
        </p>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">
            Motivo de baja <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={3}
            required
            placeholder="Escribe el motivo de la baja..."
          />
        </div>
        <div className="min-h-[40px] text-center text-sm transition-all duration-300 mb-2">
          {error && <p className="text-red-600">{error}</p>}
          {msg && (
            <p className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
          <Button variant="danger" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}