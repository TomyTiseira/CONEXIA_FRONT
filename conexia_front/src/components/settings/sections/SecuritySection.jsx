'use client';

import { useRouter } from 'next/navigation';
import SettingCard from '../shared/SettingCard';

export default function SecuritySection() {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Seguridad</h2>

      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm">
        <SettingCard
          title="Cambiar contraseña"
          description="Recomendamos actualizar tu contraseña regularmente para mantener tu cuenta segura."
          buttonLabel="Cambiar"
          onClick={() => router.push('/settings/security/change-password')}
        />
      </div>
    </div>
  );
}
