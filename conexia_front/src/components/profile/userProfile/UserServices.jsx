import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserServices } from '@/hooks/services';
import ServiceList from '@/components/services/ServiceList';
import { useAuth } from '@/context/AuthContext';
import { Briefcase } from 'lucide-react';

export default function UserServices({ userId }) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { services, loading, error, loadUserServices } = useUserServices(userId);

  // Determinar si el usuario autenticado es el dueño
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  useEffect(() => {
    if (userId) {
      loadUserServices();
    }
  }, [userId, loadUserServices]);

  // Función para recargar servicios cuando se actualicen
  const handleServiceUpdated = () => {
    if (loadUserServices) {
      loadUserServices();
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-6 h-6 text-conexia-green" />
            <h3 className="text-base md:text-lg font-bold text-conexia-green">Servicios</h3>
          </div>
          <div className="text-gray-500 text-sm md:text-base">Cargando servicios...</div>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  // Mostrar solo los primeros 3 servicios
  const topServices = services.slice(0, 3);

  return (
    <div className="mt-8">
      <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-6 h-6 text-conexia-green" />
          <h3 className="text-base md:text-lg font-bold text-conexia-green">
            {isOwner ? 'Mis Servicios' : `Servicios`}
          </h3>
        </div>
        <div className="text-gray-500 text-xs md:text-sm mb-2">
          Servicios publicados recientemente en la comunidad.
        </div>
        <div className="w-full">
          <ServiceList 
            services={topServices} 
            loading={false}
            error={null}
            showInactiveLabel={false}
            isOwnerView={isOwner}
            onServiceUpdated={handleServiceUpdated}
          />
        </div>
        
        {/* Botón ver más */}
        {services.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
            <a
              href={`/services/profile/${userId}`}
              className="w-full sm:w-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
              style={{ minHeight: '40px' }}
            >
              <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              <span className="w-full text-center">Ver más…</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}