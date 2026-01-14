'use client';
import { motion } from 'framer-motion';
import { BarChart3, PieChart } from 'lucide-react';

/**
 * Componente para mostrar distribución de respuestas de opción múltiple
 * @param {Object} props
 * @param {Array} props.questions - Array de MultipleChoiceQuestion
 */
export const MultipleChoiceDistribution = ({ questions = [] }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay preguntas de opción múltiple</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => {
        const totalResponses = question.options.reduce((sum, opt) => sum + opt.count, 0);

        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: qIndex * 0.1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
          >
            {/* Pregunta */}
            <div className="flex items-start gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">
                  Pregunta {qIndex + 1}
                </h4>
                <p className="text-gray-700">{question.questionText}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Total de respuestas: {totalResponses}
                </p>
              </div>
            </div>

            {/* Distribución de opciones */}
            <div className="space-y-3">
              {question.options.map((option, oIndex) => {
                const percentage = totalResponses > 0 
                  ? ((option.count / totalResponses) * 100).toFixed(1) 
                  : 0;

                return (
                  <div key={oIndex} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 flex-1 mr-2">
                        {option.optionText}
                      </span>
                      <span className="font-bold text-gray-900">
                        {option.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: (qIndex * 0.1) + (oIndex * 0.05) }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2"
                      >
                        {percentage > 10 && (
                          <span className="text-xs font-bold text-white">
                            {percentage}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico circular simple (opcional) */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3 justify-center">
                {question.options.map((option, oIndex) => {
                  const percentage = totalResponses > 0 
                    ? ((option.count / totalResponses) * 100).toFixed(1) 
                    : 0;
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-red-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-orange-500'
                  ];

                  return (
                    <div key={oIndex} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[oIndex % colors.length]}`} />
                      <span className="text-xs text-gray-600">
                        {option.optionText.substring(0, 20)}
                        {option.optionText.length > 20 ? '...' : ''}: {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
