'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TimeoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeoutReason = searchParams.get('timeout');
    if (!timeoutReason) {
      router.replace('/login'); // Redirige si accede manualmente sin motivo
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-conexia-soft flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
        {/* Icono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-conexia-coral flex items-center justify-center">
            <span className="text-conexia-coral text-4xl font-bold">!</span>
          </div>
        </div>

        {/* Texto principal */}
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Sesión caducada</h1>
        <p className="text-gray-600 text-sm mb-1">Tu sesión ha caducado por inactividad.</p>
        <p className="text-gray-600 text-sm mb-6">Vuelve a iniciar sesión.</p>

        {/* Botón */}
        <button
          onClick={() => router.push('/login')}
          className="bg-conexia-green text-white font-semibold rounded w-full py-2 hover:bg-conexia-green/90"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
