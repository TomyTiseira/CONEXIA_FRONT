'use client';
import { motion } from 'framer-motion';
import { FolderPlus, Calendar } from 'lucide-react';

/**
 * Gráfico para nuevos proyectos en diferentes períodos
 */
export const NewProjectsChart = ({ last7Days, last30Days, last90Days }) => {
  const maxValue = Math.max(last7Days, last30Days, last90Days) || 1;

  const periods = [
    { label: '7 días', value: last7Days, color: 'bg-purple-500', lightColor: 'bg-purple-100' },
    { label: '30 días', value: last30Days, color: 'bg-blue-500', lightColor: 'bg-blue-100' },
    { label: '90 días', value: last90Days, color: 'bg-green-500', lightColor: 'bg-green-100' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-blue-50">
          <FolderPlus className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Nuevos proyectos</h3>
          <p className="text-sm text-gray-500">Proyectos por período</p>
        </div>
      </div>

      {/* Barras horizontales */}
      <div className="space-y-4">
        {periods.map((period, index) => {
          const percentage = maxValue > 0 ? (period.value / maxValue) * 100 : 0;
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{period.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{period.value}</span>
              </div>
              <div className={`w-full ${period.lightColor} rounded-full h-3 overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className={`h-full ${period.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <span className="text-sm font-semibold text-gray-700">Total últimos 90 días</span>
          <span className="text-2xl font-bold text-purple-600">{last90Days}</span>
        </div>
      </div>
    </motion.div>
  );
};
