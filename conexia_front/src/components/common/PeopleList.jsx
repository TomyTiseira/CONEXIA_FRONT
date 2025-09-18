import React from 'react';

export default function PeopleList({ people = [] }) {
  if (!people.length) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron personas.</div>;
  }
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch mt-0 w-full px-6 sm:px-0">
      {people.map((person) => (
        <div key={person.id} className="bg-white rounded-2xl shadow-md p-4 flex flex-col h-full items-stretch w-full hover:shadow-lg transition relative">
          <div className="flex flex-col items-center justify-center mb-3">
            <img
              src={person.profilePicture || '/images/default-avatar.png'}
              alt={person.name || 'Usuario'}
              className="w-20 h-20 rounded-full object-cover border-4 border-white bg-[#f3f9f8] shadow-sm mb-2"
            />
            <h3 className="font-bold text-conexia-green text-base sm:text-lg leading-tight break-words text-center line-clamp-2">
              {person.name} {person.lastName}
            </h3>
            <div className="text-gray-500 text-sm text-center mt-1">{person.profession || person.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
