'use client';
import { motion } from 'framer-motion';
import { TrendingUp, FolderCheck, Users } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico visual para engagement de proyectos
 */
export const ProjectEngagementChart = ({ 
  projectsWithPostulations, 
  totalProjects, 
  projectEngagementRate 
}) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  if (!totalProjects || totalProjects === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-50">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Engagement de proyectos</h3>
            <p className="text-sm text-gray-500">No hay proyectos registrados</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const projectsWithoutPostulations = totalProjects - projectsWithPostulations;
  const engagementRate = projectEngagementRate || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-50">
          <TrendingUp className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Engagement de proyectos</h3>
          <p className="text-sm text-gray-500">Proyectos con postulaciones</p>
        </div>
      </div>

      {/* Gráfico circular */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={hoveredSection === 'without' ? "22" : "20"}
              onMouseEnter={() => setHoveredSection('without')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'without' ? 1 : 0.6
              }}
            />
            {/* Círculo de progreso */}
            <motion.circle
              initial={{ strokeDasharray: '0 251.327' }}
              animate={{ strokeDasharray: `${engagementRate * 2.51327} 251.327` }}
              transition={{ duration: 1, delay: 0.3 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#9333EA"
              strokeWidth={hoveredSection === 'with' ? "22" : "20"}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('with')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'with' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'with' ? (
              <>
                <span className="text-3xl font-bold text-purple-600">{projectsWithPostulations}</span>
                <span className="text-sm text-gray-500">Con postulaciones</span>
                <span className="text-xs text-gray-400">{engagementRate.toFixed(1)}%</span>
              </>
            ) : hoveredSection === 'without' ? (
              <>
                <span className="text-3xl font-bold text-gray-600">{projectsWithoutPostulations}</span>
                <span className="text-sm text-gray-500">Sin postulaciones</span>
                <span className="text-xs text-gray-400">{(100 - engagementRate).toFixed(1)}%</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-purple-600">{engagementRate.toFixed(1)}%</span>
                <span className="text-sm text-gray-500">Con actividad</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Con postulaciones</span>
          </div>
          <span className="text-lg font-bold text-purple-600">{projectsWithPostulations}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sin postulaciones</span>
          </div>
          <span className="text-lg font-bold text-gray-600">{projectsWithoutPostulations}</span>
        </div>
      </div>
    </motion.div>
  );
};
