'use client';

import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAnalyzedReports } from '@/hooks/moderation/useAnalyzedReports';
import ReportsTable from './ReportsTable';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Modal para mostrar todos los reportes analizados por la IA
 * Agrupa reportes por tipo: servicios, proyectos y publicaciones
 */
export default function AnalyzedReportsModal({ analysisId, userId, classification, onClose }) {
  const [activeTab, setActiveTab] = useState('services');
  const { data, loading, error, loadReports, retry } = useAnalyzedReports(analysisId);

  // Cargar reportes al montar el componente
  useEffect(() => {
    if (analysisId) {
      loadReports();
    }
  }, [analysisId, loadReports]);

  // Obtener contadores por tipo
  const getCounts = () => {
    if (!data?.reports) {
      return { services: 0, projects: 0, publications: 0 };
    }
    return {
      services: data.reports.services?.length || 0,
      projects: data.reports.projects?.length || 0,
      publications: data.reports.publications?.length || 0,
    };
  };

  const counts = getCounts();

  // Tabs de navegación
  const tabs = [
    { id: 'services', label: 'Servicios', count: counts.services },
    { id: 'projects', label: 'Proyectos', count: counts.projects },
    { id: 'publications', label: 'Publicaciones', count: counts.publications },
  ];

  // Obtener reportes del tab activo
  const getActiveReports = () => {
    if (!data?.reports) return [];
    return data.reports[activeTab] || [];
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8 relative max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-conexia-green flex items-center gap-2">
              <FileText className="w-7 h-7" />
              Reportes Analizados por IA
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Usuario: <Link 
                href={`/profile/${userId}`}
                className="font-semibold text-conexia-green hover:underline"
                target="_blank"
              >
                {data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}` : `#${userId}`}
              </Link> • 
              Clasificación: <span className={`font-semibold ${classification === 'Banear' ? 'text-red-600' : 'text-yellow-600'}`}>
                {classification}
              </span> •
              Total: <span className="font-semibold">{data?.totalReports || 0} reportes</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <LoadingSpinner message="Cargando reportes..." fullScreen={false} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-800 font-semibold mb-2">Error al cargar reportes</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <Button onClick={retry} variant="primary">
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'border-conexia-green text-conexia-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold ${
                        activeTab === tab.id
                          ? 'bg-conexia-green text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content - con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsTable reports={getActiveReports()} type={activeTab} />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <Button
            onClick={onClose}
            variant="cancel"
            className="px-6 py-2"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
