'use client';
import { motion } from 'framer-motion';
import { Users, FileText, AlertCircle } from 'lucide-react';
import { EvaluationResultsTable } from './EvaluationResultsTable';
import { MultipleChoiceDistribution } from './MultipleChoiceDistribution';
import { OpenAnswersList } from './OpenAnswersList';

/**
 * Componente para mostrar estadísticas de un rol específico
 * @param {Object} props
 * @param {Object} props.roleStats - RoleStatistics
 */
export const RoleStatsCard = ({ roleStats }) => {
  if (!roleStats) return null;

  const {
    roleName,
    totalPostulations,
    hasQuestionsWithCorrectAnswer,
    evaluationResults,
    multipleChoiceDistribution,
    openAnswers,
    hasEvaluationFile
  } = roleStats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#48a6a7] to-[#419596] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">{roleName}</h3>
              <p className="text-white/90 text-sm">
                {totalPostulations} postulación{totalPostulations !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Sin postulaciones */}
        {totalPostulations === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Este rol aún no tiene postulaciones</p>
          </div>
        )}

        {/* Evaluación con respuestas correctas */}
        {hasQuestionsWithCorrectAnswer && evaluationResults && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Resultados de evaluación
            </h4>
            <EvaluationResultsTable 
              results={evaluationResults}
              roleName={roleName}
            />
          </div>
        )}

        {/* Preguntas de opción múltiple */}
        {multipleChoiceDistribution && multipleChoiceDistribution.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Distribución de respuestas
            </h4>
            <MultipleChoiceDistribution questions={multipleChoiceDistribution} />
          </div>
        )}

        {/* Respuestas abiertas */}
        {openAnswers && openAnswers.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Respuestas abiertas
            </h4>
            <OpenAnswersList questions={openAnswers} />
          </div>
        )}

        {/* Mensaje de archivo de evaluación */}
        {hasEvaluationFile && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">
                  Evaluación técnica requerida
                </h5>
                <p className="text-sm text-blue-700 mb-3">
                  Este rol requiere CV o evaluación técnica. Debes revisarlos 
                  individualmente en cada postulación.
                </p>
                <button
                  onClick={() => window.location.href = `/project/${roleStats.projectId}/postulations`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Ver postulaciones →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sin información de evaluación */}
        {!hasQuestionsWithCorrectAnswer && 
         (!multipleChoiceDistribution || multipleChoiceDistribution.length === 0) &&
         (!openAnswers || openAnswers.length === 0) &&
         !hasEvaluationFile &&
         totalPostulations > 0 && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">
              Este rol no tiene preguntas de evaluación configuradas
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
