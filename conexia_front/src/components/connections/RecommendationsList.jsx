import React from 'react';
import { ConnectionCard, filterRecommendations } from './ConnectionCard';

/**
 * RecommendationsList: Muestra una lista de tarjetas de conexiones recomendadas
 * Props:
 * - allUsers: array de usuarios
 * - myContacts: array de IDs de contactos actuales
 * - mySkills: array de habilidades del usuario logueado
 * - friendsMap: { userId: [friendIds] }
 * - myId: ID del usuario logueado
 * - onConnect: función para conectar
 * - max: cantidad máxima de recomendaciones a mostrar (default: 12)
 */
export function RecommendationsList({ allUsers, myContacts, mySkills, friendsMap, myId, onConnect, max = 12 }) {
  const recommendations = filterRecommendations(allUsers, myContacts, mySkills, friendsMap, myId).slice(0, max);

  // mini: si true, renderiza lista vertical compacta tipo LinkedIn
  return (
    <div className={"flex flex-col gap-1 w-full" + (arguments[0].mini ? "" : " grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6") }>
      {recommendations.map(user => (
        <ConnectionCard
          key={user.id}
          profilePhoto={user.profilePhoto}
          coverPhoto={user.coverPhoto}
          firstName={user.firstName}
          lastName={user.lastName}
          profession={user.profession}
          onConnect={() => onConnect(user.id)}
          mini={arguments[0].mini}
        />
      ))}
    </div>
  );
}
