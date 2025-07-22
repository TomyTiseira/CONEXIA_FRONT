'use client';

import SettingCard from "../shared/SettingCard";

export default function PrivacySection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Privacidad</h2>

      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm">
        <SettingCard
          title="Visibilidad de información básica"
          description="Público"
          buttonLabel="Cambiar"
          onClick={() => {/* lógica para cambiar visibilidad */}}
        />
      </div>
    </div>
  );
}
