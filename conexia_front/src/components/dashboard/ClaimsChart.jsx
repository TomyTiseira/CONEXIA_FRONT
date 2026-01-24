'use client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico visual para reclamos - estilo consistente con otros charts del dashboard
 */
export const ClaimsChart = ({ claims }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  if (!claims || claims.totalClaims === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-50">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Reclamos</h3>
            <p className="text-sm text-green-600">✅ Sin reclamos activos</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const resolutionRate = claims.resolutionRate || 0;
  const activeClaims = claims.totalClaims - claims.resolvedClaims;
  const avgDays = (claims.averageResolutionTimeInHours / 24).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-amber-50">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Reclamos</h3>
          <p className="text-sm text-gray-500">Gestión de conflictos</p>
        </div>
      </div>

      {/* Gráfico circular - Tasa de resolución */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={hoveredSection === 'active' ? "22" : "20"}
              onMouseEnter={() => setHoveredSection('active')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'active' ? 1 : 0.6
              }}
            />
            {/* Círculo de progreso */}
            <motion.circle
              initial={{ strokeDasharray: '0 251.327' }}
              animate={{ strokeDasharray: `${resolutionRate * 2.51327} 251.327` }}
              transition={{ duration: 1, delay: 0.3 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth={hoveredSection === 'resolved' ? "22" : "20"}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('resolved')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'resolved' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'resolved' ? (
              <>
                <span className="text-3xl font-bold text-green-600">{claims.resolvedClaims}</span>
                <span className="text-sm text-gray-500">Resueltos</span>
                <span className="text-xs text-gray-400">{resolutionRate.toFixed(1)}%</span>
              </>
            ) : hoveredSection === 'active' ? (
              <>
                <span className="text-3xl font-bold text-amber-600">{activeClaims}</span>
                <span className="text-sm text-gray-500">Activos</span>
                <span className="text-xs text-gray-400">{(100 - resolutionRate).toFixed(1)}%</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-green-600">{resolutionRate.toFixed(1)}%</span>
                <span className="text-sm text-gray-500">Resueltos</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Resueltos</span>
          </div>
          <span className="text-lg font-bold text-green-600">{claims.resolvedClaims}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Activos</span>
          </div>
          <span className="text-lg font-bold text-amber-600">{activeClaims}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Tiempo promedio de resolución</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{avgDays} días</span>
        </div>
      </div>
    </motion.div>
  );
};
