'use client';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico circular de postulaciones (aceptadas vs totales)
 */
export const PostulationsChart = ({ totalPostulations, acceptedPostulations, successRate }) => {
  const data = [
    { name: 'Aceptadas', value: acceptedPostulations, color: '#35ba5b' },
    { name: 'Pendientes/Rechazadas', value: totalPostulations - acceptedPostulations, color: '#9fa7a7' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-gray-100">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} postulaciones</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Postulaciones"
      description="Tasa de aceptación de tus postulaciones"
    >
      <div className="flex flex-col items-center">
        {/* Texto central del donut */}
        <div className="relative w-full h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Label central absoluto */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-4xl font-bold text-gray-800">{successRate}%</div>
            <div className="text-sm text-gray-500">Éxito</div>
          </div>
        </div>

        {/* Legend personalizada */}
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#35ba5b]" />
            <div className="text-sm">
              <span className="font-semibold text-gray-800">{acceptedPostulations}</span>
              <span className="text-gray-600"> Aceptadas</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#9fa7a7]" />
            <div className="text-sm">
              <span className="font-semibold text-gray-800">{totalPostulations}</span>
              <span className="text-gray-600"> Total Enviadas</span>
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};
