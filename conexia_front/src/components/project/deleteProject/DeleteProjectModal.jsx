"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { deleteProjectById } from "@/service/project/projectFetch"; // Corregido: projectFetch en singular
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export default function DeleteProjectModal({ projectId, onCancel, onProjectDeleted, loading, project, searchParams }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  // Eliminamos mensajes inline; usaremos sessionStorage + redirect toast
  const router = useRouter();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);
  const handleSubmit = async () => {
    if (processing) return;
    setError("");
    if (!motivo.trim()) {
      setError("El motivo de baja es obligatorio.");
      return;
    }
    setProcessing(true);
    try {
      await deleteProjectById(projectId, motivo);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('projectDeletionToast', JSON.stringify({
          type: 'success',
          message: 'Proyecto eliminado correctamente.'
        }));
      }
    } catch (err) {
      console.error("Error al eliminar proyecto:", err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('projectDeletionToast', JSON.stringify({
          type: 'error',
          message: err.message || 'Error al eliminar el proyecto.'
        }));
      }
    } finally {
      onProjectDeleted?.();
      onCancel?.();
      
      // Lógica de redirección basada en el parámetro 'from'
      const from = searchParams?.get('from');
      const fromReportsProjectId = searchParams?.get('fromReportsProjectId');
      
      if (from === 'reports-project' && fromReportsProjectId) {
        router.push(`/reports/project/${fromReportsProjectId}`);
      } else if (from === 'reports') {
        router.push('/reports');
      } else if (from === 'profile' && project && project.ownerId) {
        router.push(`/profile/userProfile/${project.ownerId}`);
      } else if (from === 'user-projects' && project && project.ownerId) {
        router.push(`/projects/user/${project.ownerId}`);
      } else if (from === 'my-projects' && user && user.id) {
        router.push(`/projects/user/${user.id}`);
      } else {
        router.push('/project/search');
      }
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
            className="w-full border rounded p-2 text-sm resize-none overflow-y-auto"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={3}
            required
            placeholder="Escribe el motivo de la baja..."
            style={{ minHeight: '72px', maxHeight: '120px' }}
          />
        </div>
        <div className="min-h-[24px] mb-2 text-center text-sm text-red-600">
          {error || '\u00A0'}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="success" onClick={handleSubmit} disabled={loading || processing}>
            {processing || loading ? "Eliminando..." : "Confirmar"}
          </Button>
          <Button variant="cancel" onClick={onCancel} disabled={loading || processing}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}