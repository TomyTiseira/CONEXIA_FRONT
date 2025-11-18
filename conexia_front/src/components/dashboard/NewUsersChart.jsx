'use client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico de línea temporal para nuevos usuarios
 */
export const NewUsersChart = ({ last7Days, last30Days, last90Days }) => {
  const data = [
    { period: 'Últimos 7 días', usuarios: last7Days, label: '7d' },
    { period: 'Últimos 30 días', usuarios: last30Days, label: '30d' },
    { period: 'Últimos 90 días', usuarios: last90Days, label: '90d' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-[#48a6a7]/20">
          <p className="font-semibold text-gray-800">{payload[0].payload.period}</p>
          <p className="text-sm text-[#48a6a7]">
            {payload[0].value} nuevos usuarios
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Nuevos usuarios"
      description="Crecimiento de usuarios en diferentes períodos"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#48a6a7" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#48a6a7" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="usuarios" 
            stroke="#48a6a7" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorUsuarios)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
