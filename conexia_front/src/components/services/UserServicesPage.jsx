'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserServices } from '@/hooks/services';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { FaTools } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import ServiceList from '@/components/services/ServiceList';

export default function UserServicesPage({ userId }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { roleName } = useUserStore();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  
  const { services, pagination, loading, error, loadUserServices } = useUserServices(userId);

  // Determinar si el usuario autenticado es el dueño
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  useEffect(() => {
    if (userId) {
      loadUserServices({ 
        page, 
        limit: 12, 
        includeInactive: isOwner ? includeInactive : false 
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page, includeInactive, isOwner]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleIncludeInactiveChange = () => {
    setIncludeInactive(!includeInactive);
    setPage(1); // Reset to first page when filter changes
  };

  // Función para recargar servicios cuando se actualicen
  const handleServiceUpdated = () => {
    loadUserServices({ 
      page, 
      limit: 12, 
      includeInactive: isOwner ? includeInactive : false 
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f0f8f8] py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight">
                  {isOwner ? 'Mis Servicios' : 'Servicios del Usuario'}
                </h1>
                <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                  {isOwner 
                    ? 'Gestiona y visualiza todos tus servicios publicados' 
                    : 'Explora los servicios ofrecidos por este usuario'
                  }
                </p>
              </div>
              
              {/* Filtros (solo para el propietario) - Alineado a la derecha */}
              {isOwner && (
                <div className="flex items-center justify-end mt-4 sm:mt-0">
                  <label className="flex items-center gap-2 cursor-pointer bg-white rounded-lg shadow-sm border p-3">
                    <input
                      type="checkbox"
                      checked={includeInactive}
                      onChange={handleIncludeInactiveChange}
                      className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Ver también servicios inactivos
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-6">
            {!loading && services.length > 0 && (
              <p className="text-gray-600 text-sm">
                Mostrando {services.length} de {pagination.total} servicio{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Lista de servicios */}
          <ServiceList 
            services={services}
            loading={loading}
            error={error}
            showInactiveLabel={isOwner && includeInactive}
            emptyMessage={isOwner ? "No has publicado ningún servicio aún" : "Este usuario no ha publicado servicios"}
            emptyDescription={isOwner 
              ? "¡Publica tu primer servicio y conecta con potenciales clientes!" 
              : "Explora otros perfiles para encontrar servicios interesantes."
            }
            isOwnerView={isOwner}
            onServiceUpdated={handleServiceUpdated}
          />

          {/* Estado vacío con CTA para el propietario */}
          {!loading && !error && services.length === 0 && isOwner && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-conexia-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTools className="w-8 h-8 text-conexia-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    ¡Publica tu primer servicio!
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Comparte tus habilidades y conocimientos con la comunidad. 
                    Publica servicios y conecta con potenciales clientes.
                  </p>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => router.push('/services/create')}
                    className="inline-flex items-center gap-2"
                  >
                    <FaTools size={16} />
                    Publicar servicio
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botón Atrás y Paginado */}
          <div className="mt-6">
            {/* En móvil: botón atrás a la izquierda y paginado centrado en la misma línea */}
            <div className="flex items-center md:hidden">
              <BackButton
                text={isOwner ? 'Volver a mi perfil' : 'Atrás'}
                onClick={() => {
                  if (isOwner) {
                    router.push(`/profile/userProfile/${userId}`);
                  } else {
                    router.back();
                  }
                }}
                className="h-[38px] whitespace-nowrap text-sm"
              />
              {pagination.totalPages > 1 && (
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex items-center -mt-6">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* En desktop: botón atrás a la izquierda, paginado centrado */}
            <div className="hidden md:flex md:items-center">
              <BackButton
                text={isOwner ? 'Volver a mi perfil' : 'Atrás'}
                onClick={() => {
                  if (isOwner) {
                    router.push(`/profile/userProfile/${userId}`);
                  } else {
                    router.back();
                  }
                }}
                className="h-[38px] whitespace-nowrap text-sm"
              />
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex items-center -mt-6">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              {/* Espaciador invisible para mantener el centrado */}
              <div className="w-[72px] flex items-center"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}