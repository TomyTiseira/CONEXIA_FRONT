'use client';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Medal, Award } from 'lucide-react';

/**
 * Componente para mostrar el ranking de proyectos más populares (Plan Premium)
 * @param {Object} props
 * @param {string} props.title - Título de la tarjeta
 * @param {Array} props.projects - Array de proyectos con {projectId, projectTitle, postulationsCount}
 */
export const ProjectRankingCard = ({ title = 'Top 5 Proyectos Más Populares', projects = [] }) => {
  // Limitar a los primeros 5 proyectos
  const topProjects = projects.slice(0, 5);
  if (!projects || projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aún no tienes proyectos con postulaciones</p>
        </div>
      </motion.div>
    );
  }

  // Iconos para los primeros 3 lugares
  const getMedalIcon = (index) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (index === 1) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50' };
    if (index === 2) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: TrendingUp, color: 'text-gray-400', bg: 'bg-gray-50' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50">
          <Trophy className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">Proyectos con más postulaciones</p>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="space-y-3">
        {topProjects.map((project, index) => {
          const medal = getMedalIcon(index);
          const MedalIcon = medal.icon;
          const isTopThree = index < 3;

          return (
            <motion.div
              key={project.projectId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                relative flex items-center gap-4 p-4 rounded-lg
                ${isTopThree 
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200' 
                  : 'bg-gray-50 border border-gray-200'
                }
                hover:shadow-md transition-all duration-200
                group
              `}
            >
              {/* Posición y medalla */}
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isTopThree ? medal.bg : 'bg-white'}
                  border ${isTopThree ? 'border-amber-200' : 'border-gray-300'}
                  font-bold text-sm
                  ${isTopThree ? medal.color : 'text-gray-600'}
                `}>
                  {index + 1}
                </div>
                
                {isTopThree && (
                  <MedalIcon className={`w-5 h-5 ${medal.color}`} />
                )}
              </div>

              {/* Información del proyecto */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate group-hover:text-[#48a6a7] transition-colors">
                  {project.projectTitle}
                </h4>
                <p className="text-xs text-gray-500">
                  ID: {project.projectId}
                </p>
              </div>

              {/* Contador de postulaciones */}
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className={`
                    text-2xl font-bold
                    ${isTopThree ? 'text-amber-600' : 'text-gray-700'}
                  `}>
                    {project.postulationsCount}
                  </span>
                  <TrendingUp className={`
                    w-4 h-4 
                    ${isTopThree ? 'text-amber-500' : 'text-gray-400'}
                  `} />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  postulaciones
                </span>
              </div>

              {/* Badge especial para el primer lugar */}
              {index === 0 && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🏆 #1
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer con stats */}
      {topProjects.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Top proyectos:</span>
            <span className="font-bold text-gray-800">{topProjects.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Postulaciones (Top 5):</span>
            <span className="font-bold text-amber-600">
              {topProjects.reduce((sum, p) => sum + p.postulationsCount, 0)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
