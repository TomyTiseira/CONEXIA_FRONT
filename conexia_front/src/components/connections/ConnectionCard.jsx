import React from 'react';

/**
 * ConnectionCard: Tarjeta para mostrar perfil recomendado
 * Props:
 * - profilePhoto: string (url)
 * - coverPhoto: string (url)
 * - firstName: string
 * - lastName: string
 * - profession: string
 * - onConnect: function
 */
export function ConnectionCard({ profilePhoto, coverPhoto, firstName, lastName, profession, onConnect }) {
  // mini: si true, renderiza estilo LinkedIn sidebar
  if (arguments[0].mini) {
    return (
      <div className="flex items-center gap-2 py-2 px-1 hover:bg-gray-50 rounded transition">
        <img src={profilePhoto} alt="Perfil" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{firstName} {lastName}</div>
          <div className="text-xs text-gray-500 truncate max-w-[140px]">{profession}</div>
        </div>
        <button onClick={onConnect} className="ml-2 border border-conexia-green text-conexia-green px-3 py-1 rounded-full font-semibold text-xs hover:bg-conexia-green hover:text-white transition-colors">+ Seguir</button>
      </div>
    );
  }
  // Card normal
  return (
    <div className="rounded-xl shadow bg-white overflow-hidden flex flex-col">
      <div className="h-20 w-full bg-gray-200" style={{ backgroundImage: `url(${coverPhoto})`, backgroundSize: 'cover' }} />
      <div className="flex flex-col items-center p-4">
        <img src={profilePhoto} alt="Perfil" className="w-16 h-16 rounded-full border-2 border-white -mt-8 mb-2 object-cover" />
        <div className="font-semibold text-lg">{firstName} {lastName}</div>
        <div className="text-sm text-gray-500 mb-2">{profession}</div>
        <button onClick={onConnect} className="bg-conexia-green text-white px-4 py-1 rounded-full font-semibold">Conectar</button>
      </div>
    </div>
  );
}

/**
 * filterRecommendations: Filtra y ordena perfiles recomendados
 * @param {Array} allUsers - Todos los usuarios
 * @param {Array} myContacts - IDs de contactos actuales
 * @param {Array} mySkills - Habilidades del usuario logueado
 * @param {Object} friendsMap - { userId: [friendIds] }
 * @returns {Array} - Lista de 12 usuarios recomendados
 */
export function filterRecommendations(allUsers, myContacts, mySkills, friendsMap, myId) {
  // Excluir contactos actuales y el propio usuario
  const candidates = allUsers.filter(u => !myContacts.includes(u.id) && u.id !== myId);

  // Calcular match de habilidades y amigos en común
  const scored = candidates.map(u => {
    const skillMatch = u.skills ? u.skills.filter(s => mySkills.includes(s)).length : 0;
    const friendsInCommon = friendsMap[myId] && u.id in friendsMap ? friendsMap[myId].filter(fid => friendsMap[u.id].includes(fid)).length : 0;
    return { ...u, skillMatch, friendsInCommon };
  });

  // Ordenar por mayor match y amigos en común
  scored.sort((a, b) => {
    if (b.skillMatch !== a.skillMatch) return b.skillMatch - a.skillMatch;
    return b.friendsInCommon - a.friendsInCommon;
  });

  // Retornar los primeros 12
  return scored.slice(0, 12);
}
