'use client';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico para postulaciones por estado
 */
export const PostulationsStatusChart = ({ postulationsByStatus, postulationApprovalRate }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  if (!postulationsByStatus || postulationsByStatus.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-50">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Postulaciones</h3>
            <p className="text-sm text-gray-500">No hay postulaciones registradas</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calcular totales - Solo postulaciones EVALUADAS (aceptadas + rechazadas)
  const acceptedPostulations = postulationsByStatus.find(s => s.statusName === 'Aceptada')?.count || 0;
  const rejectedPostulations = postulationsByStatus.find(s => s.statusName === 'Rechazada')?.count || 0;
  const evaluatedPostulations = acceptedPostulations + rejectedPostulations;
  const approvalRate = postulationApprovalRate || 0;

  // Mapear iconos y colores por estado
  const statusConfig = {
    'Aceptada': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    'Rechazada': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    'Activa': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    'Cancelada': { icon: Ban, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-blue-50">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Postulaciones</h3>
          <p className="text-sm text-gray-500">Estado de postulaciones</p>
        </div>
      </div>

      {/* Gráfico circular - Tasa de aprobación - Más compacto */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={hoveredSection === 'other' ? "20" : "18"}
              onMouseEnter={() => setHoveredSection('other')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'other' ? 1 : 0.6
              }}
            />
            {/* Círculo de progreso */}
            <motion.circle
              initial={{ strokeDasharray: '0 251.327' }}
              animate={{ strokeDasharray: `${approvalRate * 2.51327} 251.327` }}
              transition={{ duration: 1, delay: 0.3 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth={hoveredSection === 'approved' ? "20" : "18"}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('approved')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'approved' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'approved' ? (
              <>
                <span className="text-2xl font-bold text-green-600">{acceptedPostulations}</span>
                <span className="text-xs text-gray-500">Aceptadas</span>
                <span className="text-xs text-gray-400">{approvalRate.toFixed(1)}%</span>
              </>
            ) : hoveredSection === 'other' ? (
              <>
                <span className="text-2xl font-bold text-gray-600">{evaluatedPostulations}</span>
                <span className="text-xs text-gray-500">Evaluadas</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-green-600">{approvalRate.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">Aprobación</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desglose por estado - Grid de 2 columnas */}
      <div className="grid grid-cols-2 gap-3">
        {postulationsByStatus.map((status, index) => {
          const config = statusConfig[status.statusName] || statusConfig['Activa'];
          const Icon = config.icon;
          const totalPostulations = postulationsByStatus.reduce((sum, s) => sum + s.count, 0);
          const percentage = totalPostulations > 0 
            ? ((status.count / totalPostulations) * 100).toFixed(1) 
            : 0;

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-2.5 ${config.bg} rounded-lg`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-sm font-medium text-gray-700">{status.statusName}</span>
              </div>
              <div className="text-right">
                <div className={`text-base font-bold ${config.color}`}>{status.count}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Postulaciones evaluadas</span>
          <span className="text-xl font-bold text-blue-600">{evaluatedPostulations}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {acceptedPostulations} aceptadas + {rejectedPostulations} rechazadas
        </div>
      </div>
    </motion.div>
  );
};
