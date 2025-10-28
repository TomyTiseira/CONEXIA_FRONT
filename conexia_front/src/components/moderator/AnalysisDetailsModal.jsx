'use client';

import { X, AlertTriangle, Ban, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ActionButtons from './ActionButtons';
import Link from 'next/link';

/**
 * Modal de detalles de un análisis de moderación
 */
export default function AnalysisDetailsModal({ 
  analysis, 
  onClose, 
  onResolve, 
  loading = false 
}) {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-conexia-green">
            Detalles del Análisis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del Usuario */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-conexia-green" />
              Usuario Reportado
            </h3>
            <Link 
              href={`/profile/${analysis.userId}`}
              className="text-conexia-green hover:underline font-semibold text-lg block mt-2"
              target="_blank"
            >
              {analysis.firstName} {analysis.lastName}
            </Link>
          </div>

          {/* Clasificación y Estadísticas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Clasificación IA</h3>
              <div className="flex items-center gap-2">
                {analysis.classification === 'Banear' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                    <Ban className="w-4 h-4" />
                    Banear
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    Revisar
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Reportes:</span>
                  <span className="font-bold">{analysis.totalReports}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reportes Ofensivos:</span>
                  <span className="font-bold text-orange-600">{analysis.offensiveReports}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Violaciones:</span>
                  <span className="font-bold text-red-600">{analysis.violationReports}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de la IA */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Resumen del Análisis de IA
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.aiSummary}
            </p>
          </div>

          {/* Fecha del Análisis */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Analizado el{' '}
              {format(new Date(analysis.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </span>
          </div>

          {/* Separador */}
          <hr className="border-gray-300" />

          {/* Botones de Acción o Información de Resolución */}
          <ActionButtons
            analysis={analysis}
            onResolve={onResolve}
            disabled={loading}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
