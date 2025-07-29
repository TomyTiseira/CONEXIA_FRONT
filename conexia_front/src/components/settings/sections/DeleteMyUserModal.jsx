"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { deleteMyUser } from "@/service/user/userFetch";

export default function DeleteMyUserModal({ email, onConfirm, onCancel, loading, onUserDeleted }) {
  const [msg, setMsg] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    if (!motivo.trim()) {
      setError("El motivo de baja es obligatorio.");
      return;
    }
    try {
      await deleteMyUser({ motivo });
      
      // Limpiar inmediatamente todos los datos del navegador
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpiar específicamente las cookies de autenticación
        const cookiesToClear = ['access_token', 'refresh_token', 'token'];
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        });
        
        // Limpiar todas las cookies restantes
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        });
        
        // Forzar redirección a home con parámetro para evitar cache
        window.location.replace("/?logout=true");
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