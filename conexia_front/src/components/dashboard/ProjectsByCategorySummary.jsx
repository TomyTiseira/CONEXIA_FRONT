'use client';
import { motion } from 'framer-motion';
import { FolderCheck, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente para mostrar proyectos por categoría con desplegable
 */
export const ProjectsByCategorySummary = ({ projectsByCategory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!projectsByCategory || projectsByCategory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-50">
            <FolderCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Proyectos por categoría</h3>
            <p className="text-sm text-gray-500">No hay proyectos registrados</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalProjects = projectsByCategory.reduce((sum, item) => sum + (item.totalProjects || 0), 0);
  const totalPostulations = projectsByCategory.reduce((sum, item) => 
    sum + ((item.avgPostulations || 0) * (item.totalProjects || 0)), 0
  );

  // Mostrar solo primeros 3 si no está expandido
  const displayedCategories = isExpanded ? projectsByCategory : projectsByCategory.slice(0, 3);
  const hasMoreCategories = projectsByCategory.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-50">
          <FolderCheck className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Proyectos por categoría</h3>
          <p className="text-sm text-gray-500">
            Total: {totalProjects} proyectos • {totalPostulations.toFixed(0)} postulaciones
          </p>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-3">
        {displayedCategories.map((category, index) => {
          const projectCount = category.totalProjects || 0;
          const avgPostulations = category.avgPostulations || 0;
          const percentage = totalProjects > 0 
            ? ((projectCount / totalProjects) * 100).toFixed(1) 
            : 0;

          return (
            <div
              key={category.categoryId || index}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{category.categoryName}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-purple-700">
                      <FolderCheck className="w-4 h-4" />
                      <span className="font-bold">{projectCount}</span>
                      <span className="text-gray-500">proyectos ({percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-700">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{avgPostulations.toFixed(1)}</span>
                      <span className="text-gray-500">postulaciones promedio</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de expandir/colapsar */}
      {hasMoreCategories && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            mt-4 w-full flex items-center justify-center gap-2 
            py-3 px-4 rounded-lg 
            bg-gradient-to-r from-purple-100 to-indigo-100
            hover:from-purple-200 hover:to-indigo-200
            text-purple-700 font-semibold
            transition-all duration-300
            border-2 border-purple-300
          "
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Ver todas ({projectsByCategory.length} categorías)
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};
