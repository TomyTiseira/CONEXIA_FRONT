'use client';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User } from 'lucide-react';

/**
 * Componente para mostrar tabla de ranking con resultados de evaluación
 * @param {Object} props
 * @param {Array} props.results - Array de EvaluationResult
 * @param {string} [props.roleName] - Nombre del rol
 */
export const EvaluationResultsTable = ({ results = [], roleName }) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay resultados de evaluación disponibles</p>
      </div>
    );
  }

  // Función para obtener el color según el porcentaje
  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (percentage >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  };

  // Función para obtener medalla según posición
  const getMedalIcon = (index) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500' };
    if (index === 1) return { icon: Medal, color: 'text-gray-400' };
    if (index === 2) return { icon: Award, color: 'text-amber-600' };
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      {roleName && (
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-600" />
          <h4 className="text-lg font-bold text-gray-800">
            Ranking de evaluación - {roleName}
          </h4>
        </div>
      )}

      {/* Vista Desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto rounded-lg border-2 border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Respuestas correctas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total preguntas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => {
              const medal = getMedalIcon(index);
              const MedalIcon = medal?.icon;
              const colorClass = getPercentageColor(result.percentage);
              const isTopThree = index < 3;

              return (
                <motion.tr
                  key={result.postulationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-gray-50 ${isTopThree ? 'bg-amber-50/30' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">#{index + 1}</span>
                      {MedalIcon && <MedalIcon className={`w-5 h-5 ${medal.color}`} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {result.userName || `Usuario #${result.userId}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {result.correctAnswers}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-600">
                      {result.totalQuestions}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-bold border-2
                      ${colorClass.bg} ${colorClass.text} ${colorClass.border}
                    `}>
                      {result.percentage.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {results.map((result, index) => {
          const medal = getMedalIcon(index);
          const MedalIcon = medal?.icon;
          const colorClass = getPercentageColor(result.percentage);
          const isTopThree = index < 3;

          return (
            <motion.div
              key={result.postulationId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                relative rounded-lg border-2 p-4
                ${isTopThree 
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' 
                  : 'bg-white border-gray-200'
                }
              `}
            >
              {/* Header con posición */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-700">#{index + 1}</span>
                  {MedalIcon && <MedalIcon className={`w-6 h-6 ${medal.color}`} />}
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-bold border-2
                  ${colorClass.bg} ${colorClass.text} ${colorClass.border}
                `}>
                  {result.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Usuario */}
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {result.userName || `Usuario #${result.userId}`}
                </span>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.correctAnswers}
                  </div>
                  <div className="text-xs text-gray-500">Correctas</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Barra de progreso visual del ranking */}
      <div className="mt-6 space-y-2">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">Comparación Visual</h5>
        {results.slice(0, 10).map((result, index) => {
          const colorClass = getPercentageColor(result.percentage);
          return (
            <div key={result.postulationId} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-8">
                #{index + 1}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full ${colorClass.bg.replace('100', '500')} flex items-center justify-end pr-2`}
                >
                  <span className="text-xs font-bold text-white">
                    {result.percentage.toFixed(1)}%
                  </span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
