"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SettingCard from '../shared/SettingCard';
import Toast from '@/components/ui/Toast';

export default function SecuritySection() {
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('passwordChangeToast');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setToast({ visible: true, type: data.type || 'success', message: data.message || 'Operación realizada.' });
        } catch {
          // ignore
        } finally {
          sessionStorage.removeItem('passwordChangeToast');
        }
      }
    }
  }, []);

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Seguridad</h2>
      <div className="border rounded-lg divide-y overflow-hidden bg-white shadow-sm">
        <SettingCard
          title="Cambiar contraseña"
          description="Recomendamos actualizar tu contraseña regularmente para mantener tu cuenta segura."
          buttonLabel="Cambiar"
          onClick={() => router.push('/settings/security/change-password')}
        />
      </div>
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
        position="top-center"
        duration={5000}
      />
    </div>
  );
}
