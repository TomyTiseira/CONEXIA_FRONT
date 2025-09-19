import React from 'react';
import { ConnectionCard } from './ConnectionCard';

/**
 * RecommendationsList: Muestra una lista de tarjetas de conexiones recomendadas
 * Props:
 * - recommendations: array de usuarios recomendados del backend
 * - onConnect: función para conectar
 * - onViewProfile: función para ver perfil
 * - max: cantidad máxima de recomendaciones a mostrar (default: 12)
 * - mini: si true, renderiza lista vertical compacta tipo LinkedIn
 */
export function RecommendationsList({ recommendations = [], onConnect, onViewProfile, max = 12, mini = false }) {
  const displayedRecommendations = recommendations.slice(0, max);

  if (!displayedRecommendations.length) {
    return (
      <div className="text-conexia-green/70 text-center py-8">
        No hay recomendaciones disponibles en este momento.
      </div>
    );
  }

  return (
    <div className={mini ? "flex flex-col gap-1 w-full" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"}>
      {displayedRecommendations.map(user => (
        <ConnectionCard
          key={user.id}
          user={user}
          onConnect={() => onConnect(user.id)}
          onViewProfile={() => onViewProfile && onViewProfile(user.id)}
          mini={mini}
        />
      ))}
    </div>
  );
}
