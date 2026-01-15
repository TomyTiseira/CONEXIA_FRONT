'use client';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

/**
 * Gráfico de barras para proyectos por categoría
 */
export const ProjectsByCategoryChart = ({ projectsByCategory = [] }) => {
  if (!projectsByCategory || projectsByCategory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-50">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Proyectos por categoría</h3>
            <p className="text-sm text-gray-500">Distribución de proyectos activos</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          No hay proyectos para mostrar
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...projectsByCategory.map(cat => cat.totalProjects || cat.activeProjects || 0));
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-50">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Proyectos por categoría</h3>
          <p className="text-sm text-gray-500">Distribución de proyectos</p>
        </div>
      </div>

      <div className="space-y-4">
        {projectsByCategory.map((category, index) => {
          const projectCount = category.totalProjects || category.activeProjects || 0;
          const avgPostulations = category.avgPostulations || 0;
          const percentage = maxCount > 0 ? (projectCount / maxCount) * 100 : 0;
          return (
            <div key={category.categoryId || index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {category.categoryName}
                </span>
                <div className="text-right ml-2">
                  <span className="text-lg font-bold text-purple-600">
                    {projectCount}
                  </span>
                  {avgPostulations > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      ~{avgPostulations.toFixed(1)} post.
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`h-full ${colors[index % colors.length]} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
