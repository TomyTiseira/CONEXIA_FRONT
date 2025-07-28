"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { deleteMyUser } from "@/service/user/userFetch";

export default function DeleteMyUserModal({ email, onConfirm, onCancel, loading, onUserDeleted }) {
  const [msg, setMsg] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (msg?.ok) {
      const timeout = setTimeout(() => {
        setMsg(null);
        onCancel();
        if (onUserDeleted) onUserDeleted();
        // Redirigir al Home
        router.push("/");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [msg, onCancel, onUserDeleted, router]);

  const handleSubmit = async () => {
    setError("");
    if (!motivo.trim()) {
      setError("El motivo de baja es obligatorio.");
      return;
    }
    if (!confirmChecked) {
      setError("Debes confirmar la eliminación de tu cuenta.");
      return;
    }
    try {
      await deleteMyUser({ motivo });
      setMsg({ ok: true, text: "Tu cuenta fue dada de baja exitosamente." });
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Confirmar eliminación de cuenta
        </h2>
        <p className="text-sm text-conexia-green text-center mb-4 whitespace-normal md:whitespace-nowrap">
          ¿Estás seguro que deseas dar de baja tu cuenta <span className="font-semibold">{email}</span>?
        </p>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">Motivo de baja <span className="text-red-500">*</span></label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={3}
            required
            placeholder="Escribe el motivo de la baja..."
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={confirmChecked}
            onChange={e => setConfirmChecked(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="confirmDelete" className="text-sm text-conexia-green">Confirmo que deseo eliminar mi cuenta</label>
        </div>
        <div className="min-h-[40px] text-center text-sm transition-all duration-300 mb-2">
          {error && <p className="text-red-600">{error}</p>}
          {msg && (
            <p className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="danger" onClick={handleSubmit} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button variant="neutral" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}