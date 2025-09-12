import React from 'react';
import { RecommendationsList } from './RecommendationsList';
import { useRouter } from 'next/navigation';

/**
 * MiniRecommendations: Sección lateral para el home con 3 recomendaciones y botón para ver todas
 * Props:
 * - recommendations: array de recomendaciones del backend
 * - onConnect: función para conectar con un usuario
 * - loading: boolean para mostrar estado de carga
 * - error: string con mensaje de error si existe
 */
export function MiniRecommendations({ recommendations = [], onConnect, loading = false, error = null }) {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/connections?section=recommended');
  };

  const handleViewProfile = (userId) => {
    router.push(`/profile/userProfile/${userId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-w-[260px]">
        <h3 className="font-bold text-base mb-2">Añade a tu red</h3>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-conexia-green"></div>
          <span className="ml-2 text-sm text-conexia-green">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-w-[260px]">
        <h3 className="font-bold text-base mb-2">Añade a tu red</h3>
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-w-[260px]">
        <h3 className="font-bold text-base mb-2">Añade a tu red</h3>
        <div className="text-center py-4">
          <p className="text-sm text-conexia-green/70">No hay recomendaciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-w-[260px]">
      <h3 className="font-bold text-base mb-2">Añade a tu red</h3>
      <div className="flex flex-col gap-1">
        <RecommendationsList
          recommendations={recommendations}
          onConnect={onConnect}
          onViewProfile={handleViewProfile}
          max={3}
          mini={true}
        />
      </div>
      {recommendations.length > 0 && (
        <button
          className="mt-2 bg-white border border-conexia-green text-conexia-green px-3 py-1 rounded-full font-semibold self-center hover:bg-conexia-green hover:text-white transition-colors text-xs"
          style={{ minWidth: 0, width: 'auto' }}
          onClick={handleViewAll}
        >
          Ver todas las recomendaciones
        </button>
      )}
    </div>
  );
}
