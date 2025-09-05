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
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-conexia-green/10">
            <MdBarChart size={20} color="#1e6e5c" />
          </span>
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
        <div className="flex flex-col sm:flex-row justify-end mt-4">
          <Button
            variant="informative"
            className="w-full sm:w-auto flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4]"
            onClick={() => router.push(`/activities/${userId}`)}
          >
            <span>Mostrar toda la actividad</span>
            <svg
              className="w-5 h-5 text-conexia-green"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <line
                x1="13.5"
                y1="10"
                x2="6.5"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="11,7 14,10 11,13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
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
