'use client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from './ChartContainer';

/**
 * Gráfico de barras horizontales para servicios por tipo
 */
export const ServicesByTypeChart = ({ servicesByType = [] }) => {
  // Ordenar por count descendente
  const sortedData = [...servicesByType]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  // Paleta de colores variada
  const colors = [
    '#48a6a7', '#35ba5b', '#f4d81d', '#ff4953', '#9333ea',
    '#419596', '#30a752', '#dcc21a', '#e6424b', '#a855f7'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-100">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.type}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{payload[0].value}</span> contrataciones
            </p>
            <p className="text-sm text-[#35ba5b]">
              Ingresos: <span className="font-semibold">
                ${payload[0].payload.revenue.toLocaleString('es-AR')}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (sortedData.length === 0) {
    return (
      <ChartContainer
        title="Servicios por tipo"
        description="Aún no hay servicios contratados"
      >
        <div className="flex items-center justify-center h-64 text-gray-400">
          No hay datos disponibles
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Servicios por tipo"
      description="Top servicios más contratados en la plataforma"
    >
      <div className="space-y-6">
        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category" 
              dataKey="type" 
              width={150}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              animationDuration={1000}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Lista detallada */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalle por Tipo</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedData.map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-gray-800 font-medium truncate">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-600">
                    {item.count} {item.count === 1 ? 'servicio' : 'servicios'}
                  </span>
                  <span className="text-sm font-semibold text-[#35ba5b]">
                    ${item.revenue.toLocaleString('es-AR')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};
