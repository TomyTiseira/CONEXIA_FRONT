import React from 'react';
import { RecommendationsList } from './RecommendationsList';

/**
 * MiniRecommendations: Sección lateral para el home con 3 recomendaciones y botón para ver todas
 * Props:
 * - allUsers, myContacts, mySkills, friendsMap, myId, onConnect: igual que RecommendationsList
 * - onViewAll: función para navegar a la pantalla de recomendaciones
 */
export function MiniRecommendations({ allUsers, myContacts, mySkills, friendsMap, myId, onConnect, onViewAll }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-w-[260px]">
      <h3 className="font-bold text-base mb-2">Añade a tu red</h3>
      <div className="flex flex-col gap-1">
        <RecommendationsList
          allUsers={allUsers}
          myContacts={myContacts}
          mySkills={mySkills}
          friendsMap={friendsMap}
          myId={myId}
          onConnect={onConnect}
          max={3}
          mini
        />
      </div>
      <button
        className="mt-2 bg-white border border-conexia-green text-conexia-green px-3 py-1 rounded-full font-semibold self-center hover:bg-conexia-green hover:text-white transition-colors text-xs"
        style={{ minWidth: 0, width: 'auto' }}
        onClick={onViewAll}
      >
        Ver más
      </button>
    </div>
  );
}
