import React, { useEffect } from 'react';
import { MdBarChart } from 'react-icons/md';
import PublicationCard from './PublicationCard';
import Button from '@/components/ui/Button';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { closeAllPublicationCommentsExcept } from '@/utils/publicationUtils';

export default function ActivityFeed({ publications, isOwner, userId }) {
  const router = useRouter();
  const visiblePublications = publications.slice(0, 2);
  
  // Cuando este componente se monte, asegurémonos de que todas las publicaciones estén cerradas
  useEffect(() => {
    // Cerrar todas las publicaciones al montar el componente
    const allCards = document.querySelectorAll('.publication-card');
    allCards.forEach(card => {
      card.classList.remove('publication-card-open');
      card.setAttribute('data-comment-open', 'false');
    });
  }, []);
  return (
    <section className="w-full mt-8">
      <div className="bg-white rounded-2xl shadow p-6 border border-[#c6e3e4]">
        <div className="flex items-center gap-2 mb-1">
          <MdBarChart className="w-6 h-6 text-conexia-green" />
          <h3 className="text-base md:text-lg font-bold text-conexia-green">
            {isOwner ? 'Mi Actividad' : 'Actividad'}
          </h3>
        </div>
        <div className="text-gray-500 text-xs md:text-sm mb-2">Publicaciones recientes de este usuario.</div>
        {publications.length === 0 ? (
          <div className="text-conexia-green/70">No hay actividad para mostrar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {visiblePublications.map(pub => (
              <PublicationCard key={pub.id} publication={pub} isGridItem={true} />
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
          <a
            href={`/activities/${userId}`}
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
      </div>
    </section>
  );
}

ActivityFeed.propTypes = {
  publications: PropTypes.array.isRequired,
  isOwner: PropTypes.bool,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
