'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Resumen de razones de baja categorizadas
 */
export const DeletedUsersReasonsSummary = ({ topReasons }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayReasons = isExpanded ? topReasons : topReasons.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-amber-50">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Razones de baja</h3>
          <p className="text-sm text-gray-500">Motivos más comunes (categorizados)</p>
        </div>
        {topReasons.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {topReasons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos de razones de baja disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayReasons.map((reason, index) => (
            <motion.div
              key={reason.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{reason.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-amber-600">{reason.count}</span>
                  <span className="text-sm text-gray-500 font-medium">({reason.percentage}%)</span>
                </div>
              </div>
              {/* Barra de porcentaje */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reason.percentage}%` }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mensaje de expansión */}
      {topReasons.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            {isExpanded ? 'Mostrar menos razones' : `Ver todas las razones (${topReasons.length})`}
          </button>
        </div>
      )}
    </motion.div>
  );
};
