'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, User } from 'lucide-react';

/**
 * Componente para mostrar respuestas abiertas expandibles
 * @param {Object} props
 * @param {Array} props.questions - Array de OpenQuestion
 */
export const OpenAnswersList = ({ questions = [] }) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedAnswers, setExpandedAnswers] = useState({});

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay preguntas abiertas</p>
      </div>
    );
  }

  const toggleQuestion = (qIndex) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qIndex]: !prev[qIndex]
    }));
  };

  const toggleAnswer = (key) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-4">
      {questions.map((question, qIndex) => {
        const isExpanded = expandedQuestions[qIndex];

        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: qIndex * 0.05 }}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Header clickeable */}
            <button
              onClick={() => toggleQuestion(qIndex)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 text-left">
                <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">
                    Pregunta {qIndex + 1}
                  </h4>
                  <p className="text-gray-700">{question.questionText}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {question.answers.length} respuesta{question.answers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>

            {/* Respuestas expandibles */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200"
                >
                  <div className="px-6 py-4 space-y-3 bg-gray-50">
                    {question.answers.map((answer, aIndex) => {
                      const answerKey = `${qIndex}-${aIndex}`;
                      const isAnswerExpanded = expandedAnswers[answerKey];
                      const isLongAnswer = answer.answerText && answer.answerText.length > 200;

                      return (
                        <div
                          key={aIndex}
                          className="bg-white rounded-lg border border-gray-200 p-4"
                        >
                          {/* Usuario */}
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {answer.userName || `Usuario #${answer.userId}`}
                            </span>
                            <span className="text-xs text-gray-400">
                              - Postulación #{answer.postulationId}
                            </span>
                          </div>

                          {/* Respuesta */}
                          <div className="text-sm text-gray-700">
                            {isLongAnswer && !isAnswerExpanded ? (
                              <>
                                <p className="whitespace-pre-wrap">
                                  {answer.answerText.substring(0, 200)}...
                                </p>
                                <button
                                  onClick={() => toggleAnswer(answerKey)}
                                  className="text-blue-600 hover:text-blue-700 font-medium mt-2 text-xs"
                                >
                                  Ver más
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap">{answer.answerText}</p>
                                {isLongAnswer && (
                                  <button
                                    onClick={() => toggleAnswer(answerKey)}
                                    className="text-blue-600 hover:text-blue-700 font-medium mt-2 text-xs"
                                  >
                                    Ver menos
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
