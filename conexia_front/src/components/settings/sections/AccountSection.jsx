'use client';

import { useState, useEffect } from "react";
import SettingCard from "../shared/SettingCard";
import DeleteMyUserModal from "./DeleteMyUserModal";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getProfileById } from "@/service/profiles/profilesFetch";

export default function AccountSection() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      try {
        setProfileLoading(true);
        const data = await getProfileById(userId);
        setProfile(data.data.profile);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);

  // Simulación de eliminación
  const handleDeleteAccount = async () => {
    setLoading(true);
    // Aquí iría la lógica real de eliminación de cuenta
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    return { ok: true, text: "Cuenta eliminada correctamente" };
  };

  if (profileLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando información de la cuenta...</p>
      </div>
    );
  }

  // Preparar los datos para mostrar
  let displayName = 'No disponible';
  let displayEmail = 'No disponible';
  
  if (profile && (profile.name || profile.lastName)) {
    // Si hay perfil con nombre/apellido, usarlo
    displayName = `${profile.name || ''} ${profile.lastName || ''}`.trim();
    displayEmail = profile.email || user?.email || 'No disponible';
  } else if (user) {
    // Si no hay perfil pero hay usuario autenticado, usar sus datos
    displayName = user.name || user.username || user.firstName || 'Usuario';
    displayEmail = user.email || 'No disponible';
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6 text-center">Información de la cuenta</h2>
      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm w-full">
        <SettingCard title="Nombre" description={displayName} />
        <SettingCard title="Email" description={displayEmail} />
      </div>
      <div className="mt-8 flex justify-center w-full">
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Dar de baja usuario
        </Button>
      </div>
      {/* Modal de eliminación */}
      {showDeleteModal && (
        <DeleteMyUserModal
          email={displayEmail}
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
