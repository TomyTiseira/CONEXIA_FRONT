'use client';
import { motion } from 'framer-motion';
import { UserX } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico de área temporal para usuarios dados de baja
 */
export const DeletedUsersChart = ({ last7Days, last30Days, last90Days }) => {
  const data = [
    { period: 'Últimos 7 días', usuarios: last7Days, label: '7d' },
    { period: 'Últimos 30 días', usuarios: last30Days, label: '30d' },
    { period: 'Últimos 90 días', usuarios: last90Days, label: '90d' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-orange-500/20">
          <p className="font-semibold text-gray-800">{payload[0].payload.period}</p>
          <p className="text-sm text-orange-600">
            {payload[0].value} usuarios dados de baja
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Usuarios dados de baja"
      description="Usuarios que eliminaron su cuenta"
      icon={UserX}
      iconColor="orange"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDeletedUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="usuarios" 
              stroke="#f97316" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDeletedUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
