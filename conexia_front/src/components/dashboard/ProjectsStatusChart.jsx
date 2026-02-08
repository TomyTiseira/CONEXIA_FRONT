'use client';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico circular de estado de proyectos
 */
export const ProjectsStatusChart = ({ 
  totalProjects, 
  completedProjects, 
  activeProjects, 
  completionRate 
}) => {
  const otherProjects = totalProjects - completedProjects - activeProjects;
  
  const data = [
    { name: 'Completados', value: completedProjects, color: '#35ba5b' },
    { name: 'Activos', value: activeProjects, color: '#48a6a7' },
    { name: 'Otros', value: otherProjects > 0 ? otherProjects : 0, color: '#9fa7a7' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalProjects) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-gray-100">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} proyectos</p>
          <p className="text-xs text-gray-500">{percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Estado de proyectos"
      description={`Tasa de finalización: ${completionRate.toFixed(1)}%`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Gráfico */}
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de estadísticas */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Estado</span>
              <span className="text-sm font-semibold text-gray-700">Cantidad</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#35ba5b]" />
                <span className="text-sm text-gray-700">Completados</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{completedProjects}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#48a6a7]" />
                <span className="text-sm text-gray-700">Activos</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{activeProjects}</span>
            </div>

            {otherProjects > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9fa7a7]" />
                  <span className="text-sm text-gray-700">Otros</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{otherProjects}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-sm font-bold text-gray-900">{totalProjects}</span>
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};
