/**
 * @typedef {Object} EvaluationResult
 * @property {number} postulationId - ID de la postulación
 * @property {number} userId - ID del usuario
 * @property {string} [userName] - Nombre del usuario (opcional)
 * @property {number} correctAnswers - Cantidad de respuestas correctas
 * @property {number} totalQuestions - Total de preguntas
 * @property {number} percentage - Porcentaje de aciertos (0-100)
 */

/**
 * @typedef {Object} OptionDistribution
 * @property {string} optionText - Texto de la opción
 * @property {number} count - Cantidad de usuarios que seleccionaron esta opción
 */

/**
 * @typedef {Object} MultipleChoiceQuestion
 * @property {string} questionText - Texto de la pregunta
 * @property {OptionDistribution[]} options - Distribución de respuestas
 */

/**
 * @typedef {Object} OpenAnswer
 * @property {number} postulationId - ID de la postulación
 * @property {number} userId - ID del usuario
 * @property {string} [userName] - Nombre del usuario (opcional)
 * @property {string} answerText - Texto de la respuesta
 */

/**
 * @typedef {Object} OpenQuestion
 * @property {string} questionText - Texto de la pregunta
 * @property {OpenAnswer[]} answers - Lista de respuestas abiertas
 */

/**
 * @typedef {Object} RoleStatistics
 * @property {number} roleId - ID del rol
 * @property {string} roleName - Nombre del rol
 * @property {number} totalPostulations - Total de postulaciones para este rol
 * @property {boolean} hasQuestionsWithCorrectAnswer - Si tiene preguntas con respuesta correcta
 * @property {EvaluationResult[]} [evaluationResults] - Resultados de evaluación (si hasQuestionsWithCorrectAnswer = true)
 * @property {MultipleChoiceQuestion[]} [multipleChoiceDistribution] - Distribución de respuestas múltiples
 * @property {OpenQuestion[]} [openAnswers] - Respuestas abiertas
 * @property {boolean} hasEvaluationFile - Si requiere archivo de evaluación (CV, etc.)
 */

/**
 * @typedef {Object} ProjectStatistics
 * @property {number} projectId - ID del proyecto
 * @property {string} projectTitle - Título del proyecto
 * @property {number} totalPostulations - Total de postulaciones en todo el proyecto
 * @property {Object.<number, number>} postulationsByRole - Cantidad de postulaciones por rol {roleId: count}
 * @property {RoleStatistics[]} evaluationStatsByRole - Estadísticas detalladas por rol
 */

/**
 * @typedef {Object} ProjectStatisticsResponse
 * @property {boolean} success
 * @property {ProjectStatistics} data
 * @property {string} message
 */

export const PROJECT_STATS_QUERY_KEYS = {
  STATISTICS: (projectId) => ['project', 'statistics', projectId],
};
