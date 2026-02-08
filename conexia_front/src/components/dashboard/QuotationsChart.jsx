'use client';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico visual para cotizaciones - estilo consistente con otros charts del dashboard
 */
export const QuotationsChart = ({ quotations }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  if (!quotations || quotations.sent === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-50">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Cotizaciones</h3>
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const acceptanceRate = quotations.acceptanceRate || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-purple-50">
          <DollarSign className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Cotizaciones</h3>
          <p className="text-sm text-gray-500">Tasa de aceptación</p>
        </div>
      </div>

      {/* Gráfico circular */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo - Total enviadas */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E0D4F7"
              strokeWidth={hoveredSection === 'sent' ? "22" : "20"}
              onMouseEnter={() => setHoveredSection('sent')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'sent' ? 1 : 0.6
              }}
            />
            {/* Círculo de progreso - Aceptadas en VERDE */}
            <motion.circle
              initial={{ strokeDasharray: '0 251.327' }}
              animate={{ strokeDasharray: `${acceptanceRate * 2.51327} 251.327` }}
              transition={{ duration: 1, delay: 0.3 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth={hoveredSection === 'accepted' ? "22" : "20"}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('accepted')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'accepted' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'accepted' ? (
              <>
                <span className="text-3xl font-bold text-green-600">{quotations.accepted}</span>
                <span className="text-sm text-gray-500">Aceptadas</span>
                <span className="text-xs text-gray-400">{acceptanceRate.toFixed(1)}%</span>
              </>
            ) : hoveredSection === 'sent' ? (
              <>
                <span className="text-3xl font-bold text-purple-600">{quotations.sent}</span>
                <span className="text-sm text-gray-500">Enviadas</span>
                <span className="text-xs text-gray-400">100%</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-green-600">{acceptanceRate.toFixed(1)}%</span>
                <span className="text-sm text-gray-500">Aceptadas</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Enviadas</span>
          </div>
          <span className="text-base font-bold text-purple-600">{quotations.sent}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Aceptadas</span>
          </div>
          <span className="text-base font-bold text-green-600">{quotations.accepted}</span>
        </div>
      </div>
    </motion.div>
  );
};
