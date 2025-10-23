'use client';

import { AlertTriangle, Ban, CheckCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from '@/components/common/StatusBadge';
import Link from 'next/link';

/**
 * Badge de clasificación de moderación
 */
function ClassificationBadge({ classification }) {
  if (classification === 'Banear') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        <Ban className="w-3 h-3" />
        Banear
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
      <AlertTriangle className="w-3 h-3" />
      Revisar
    </span>
  );
}

/**
 * Badge de estado (resuelto/pendiente)
 */
function ResolutionBadge({ resolved }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Resuelto
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
      <Eye className="w-3 h-3" />
      Pendiente
    </span>
  );
}

/**
 * Tabla de resultados de moderación
 */
export default function ModerationTable({ results, onViewDetails, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green"></div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No hay análisis disponibles</p>
        <p className="text-gray-400 text-sm mt-2">
          Ejecuta un análisis para ver los resultados aquí
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tabla para pantallas grandes */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clasificación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ofensivos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Violaciones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((analysis) => (
              <tr key={analysis.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/profile/${analysis.userId}`}
                    className="text-conexia-green hover:underline font-medium"
                  >
                    ID: {analysis.userId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ClassificationBadge classification={analysis.classification} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                  {analysis.totalReports}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{analysis.offensiveReports}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center gap-1">
                    <Ban className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{analysis.violationReports}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(analysis.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ResolutionBadge resolved={analysis.resolved} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onViewDetails(analysis)}
                    className="text-conexia-green hover:text-conexia-green/80 font-medium text-sm underline"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="md:hidden">
        {results.map((analysis) => (
          <div key={analysis.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-3">
              <Link 
                href={`/profile/${analysis.userId}`}
                className="text-conexia-green hover:underline font-semibold text-lg"
              >
                Usuario ID: {analysis.userId}
              </Link>
              <ResolutionBadge resolved={analysis.resolved} />
            </div>
            
            <div className="mb-3">
              <ClassificationBadge classification={analysis.classification} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div className="text-center">
                <div className="text-gray-500 text-xs">Total</div>
                <div className="font-bold text-lg">{analysis.totalReports}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">Ofensivos</div>
                <div className="font-bold text-lg text-orange-600">
                  {analysis.offensiveReports}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">Violaciones</div>
                <div className="font-bold text-lg text-red-600">
                  {analysis.violationReports}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              {formatDistanceToNow(new Date(analysis.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </div>

            <button
              onClick={() => onViewDetails(analysis)}
              className="w-full bg-conexia-green text-white py-2 rounded-lg font-medium hover:bg-conexia-green/90 transition-colors"
            >
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
