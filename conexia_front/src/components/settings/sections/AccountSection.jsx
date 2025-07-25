'use client';

import SettingCard from "../shared/SettingCard";
import { useAuth } from "@/context/AuthContext";

export default function AccountSection() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Información de la cuenta</h2>

      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm">
        <SettingCard
          title="Nombre"
          description={user?.name || ""}
        />
        <SettingCard
          title="Email"
          description={user?.email || ""}
        />
      </div>
    </div>
  );
}
