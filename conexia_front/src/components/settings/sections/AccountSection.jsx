'use client';

import { useState } from "react";
import SettingCard from "../shared/SettingCard";
import DeleteMyUserModal from "./DeleteMyUserModal";
import Button from "@/components/ui/Button";

export default function AccountSection() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Simulación de datos de usuario
  const user = { name: "Alex Paredes", email: "alex@mail.com" };

  // Simulación de eliminación
  const handleDeleteAccount = async () => {
    setLoading(true);
    // Aquí iría la lógica real de eliminación de cuenta
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    return { ok: true, text: "Cuenta eliminada correctamente" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6 text-center">Información de la cuenta</h2>
      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm w-full">
        <SettingCard title="Nombre" description={user.name} />
        <SettingCard title="Email" description={user.email} />
      </div>
      <div className="mt-8 flex justify-center w-full">
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Dar de Baja
        </Button>
      </div>
      {/* Modal de eliminación */}
      {showDeleteModal && (
        <DeleteMyUserModal
          email={user.email}
          loading={loading}
          onConfirm={async (baja) => {
            setLoading(true);
            // Aquí iría la lógica real de eliminación de cuenta, usando baja.motivo y baja.fecha
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setLoading(false);
            return { ok: true, text: "Tu cuenta fue dada de baja exitosamente." };
          }}
          onCancel={() => setShowDeleteModal(false)}
          onUserDeleted={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
