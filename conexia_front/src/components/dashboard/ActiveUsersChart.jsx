'use client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico de barras para usuarios activos
 */
export const ActiveUsersChart = ({ last7Days, last30Days, last90Days }) => {
  const data = [
    { period: '7 días', usuarios: last7Days, color: '#35ba5b' },
    { period: '30 días', usuarios: last30Days, color: '#48a6a7' },
    { period: '90 días', usuarios: last90Days, color: '#419596' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-[#35ba5b]/20">
          <p className="font-semibold text-gray-800">Últimos {payload[0].payload.period}</p>
          <p className="text-sm text-[#35ba5b]">
            {payload[0].value} usuarios activos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Usuarios activos"
      description="Actividad de usuarios en diferentes períodos"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="usuarios" 
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            label={{ position: 'top', fill: '#374151', fontSize: 12, fontWeight: 600 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
