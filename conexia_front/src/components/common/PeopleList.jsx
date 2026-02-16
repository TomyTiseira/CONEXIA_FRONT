import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';

export default function PeopleList({ people = [] }) {
  const router = useRouter();
  if (!people.length) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron personas.</div>;
  }
  // Utilidad para obtener primer nombre y primer apellido
  const getShortName = (name = '', lastName = '') => {
    const firstName = name?.split(' ')[0] || '';
    const firstLastName = lastName?.split(' ')[0] || '';
    return `${firstName} ${firstLastName}`.trim();
  };
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 items-stretch mt-0 mb-6 sm:mb-0 w-full px-4 sm:px-0">
      {people.map((person) => (
        <button
          key={person.id}
          className="rounded-2xl shadow border border-[#c6e3e4] flex flex-col items-center bg-white hover:shadow-xl transition-shadow no-underline focus:outline-none w-full"
          style={{ minWidth: 'auto', maxWidth: '100%', height: 200, paddingBottom: 0, justifyContent: 'flex-start', cursor: 'pointer' }}
          tabIndex={0}
          onClick={() => router.push(`/profile/${person.id}`)}
          aria-label={`Ver perfil de ${getShortName(person.name, person.lastName)}`}
        >
          {/* Imagen de portada o fondo decorativo */}
          {person.coverPicture ? (
            <div className="w-full h-16 bg-center bg-cover relative rounded-t-2xl overflow-hidden">
              <Image
                src={person.coverPicture.startsWith('http') ? person.coverPicture : `${config.IMAGE_URL}/${person.coverPicture}`}
                alt="Portada"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-2xl"
                sizes="170px"
                priority={false}
              />
            </div>
          ) : (
            <div className="w-full h-16 bg-center bg-cover relative rounded-t-2xl" style={{ backgroundImage: 'url(/bg-smoke.png)' }} />
          )}
          {/* Foto de perfil centrada */}
          <div className="flex flex-col items-center justify-center w-full" style={{ marginTop: -40 }}>
            <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center" style={{ zIndex: 2 }}>
              <Image
                src={person.profilePicture ? (person.profilePicture.startsWith('http') ? person.profilePicture : `${config.IMAGE_URL}/${person.profilePicture}`) : '/images/default-avatar.png'}
                alt={person.name || 'Usuario'}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="font-bold text-conexia-green text-center leading-tight mt-3 mb-1 text-base" style={{ marginTop: 12 }}>
              {getShortName(person.name, person.lastName)}
            </h3>
            <div className="text-[0.90rem] text-conexia-green/80 text-center w-full px-2 line-clamp-3" style={{ lineHeight: '1.18', maxWidth: '100%', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {person.profession || person.email}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
