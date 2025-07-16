'use client';

import SettingCard from "../shared/SettingCard";

export default function AccountSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Información de la cuenta</h2>

      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm">
        <SettingCard
          title="Nombre"
          description="Alex Paredes"
        />
        <SettingCard
          title="Email"
          description="alex@mail.com"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button className="bg-conexia-green text-white px-4 py-2 rounded hover:bg-conexia-green/90">
          Editar perfil
        </button>
      </div>
    </div>
  );
}
