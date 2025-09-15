"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicationCard from './PublicationCard';
import BackButton from '@/components/ui/BackButton';
import { getPublicationById } from '@/service/publications/publicationsFetch';

export default function PublicationDetail({ publicationId, searchParams }) {
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fromReports = searchParams?.from === 'reports';
  const fromReportsPublicationId = searchParams?.fromReportsPublicationId;

  useEffect(() => {
    if (!publicationId) return;

    const loadPublication = async () => {
      try {
        setLoading(true);
        const response = await getPublicationById(publicationId);
        setPublication(response.data || response);
      } catch (err) {
        console.error('Error al cargar publicación:', err);
        setError('Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [publicationId]);

  const handleBackClick = () => {
    if (fromReports) {
      if (fromReportsPublicationId) {
        router.push(`/reports/publication/${fromReportsPublicationId}`);
      } else {
        router.push('/reports');
      }
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pt-8 pb-24">
        <div className="mx-4 md:mx-0 mb-6">
          <BackButton 
            text={fromReports ? "Volver a los reportes" : "Atrás"} 
            onClick={handleBackClick}
          />
        </div>
        <div className="bg-white px-6 py-12 rounded-xl shadow-sm mx-4 md:mx-0">
          <div className="text-center text-conexia-green">Cargando publicación...</div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="max-w-2xl mx-auto pt-8 pb-24">
        <div className="mx-4 md:mx-0 mb-6">
          <BackButton 
            text={fromReports ? "Volver a los reportes" : "Atrás"} 
            onClick={handleBackClick}
          />
        </div>
        <div className="bg-white px-6 py-12 rounded-xl shadow-sm mx-4 md:mx-0">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Publicación no encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-24">
      {/* Botón de volver */}
      <div className="mx-4 md:mx-0 mb-6">
        <BackButton 
          text={fromReports ? "Volver a los reportes" : "Atrás"} 
          onClick={handleBackClick}
        />
      </div>

      {/* Publicación */}
      <div className="mx-4 md:mx-0">
        <PublicationCard publication={publication} />
      </div>
    </div>
  );
}
