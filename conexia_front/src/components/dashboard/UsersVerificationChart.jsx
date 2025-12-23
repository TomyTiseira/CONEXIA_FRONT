'use client';
import { motion } from 'framer-motion';
import { Users, UserCheck } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico de usuarios verificados vs no verificados
 */
export const UsersVerificationChart = ({ verifiedUsers, totalUsers }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  const nonVerified = totalUsers - verifiedUsers;
  const verifiedPercentage = totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0;
  const nonVerifiedPercentage = totalUsers > 0 ? ((nonVerified / totalUsers) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-amber-50">
          <UserCheck className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Estado de Verificación</h3>
          <p className="text-sm text-gray-500">Usuarios verificados</p>
        </div>
      </div>

      {/* Gráfico de pastel simple */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo (no verificados) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={hoveredSection === 'non-verified' ? "22" : "20"}
              onMouseEnter={() => setHoveredSection('non-verified')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'non-verified' ? 1 : 0.6
              }}
            />
            {/* Círculo de progreso (verificados) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#F59E0B"
              strokeWidth={hoveredSection === 'verified' ? "22" : "20"}
              strokeDasharray={`${verifiedPercentage * 2.51327} 251.327`}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('verified')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'verified' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'verified' ? (
              <>
                <span className="text-3xl font-bold text-amber-600">{verifiedUsers}</span>
                <span className="text-sm text-gray-500">Verificados</span>
                <span className="text-xs text-gray-400">{verifiedPercentage}%</span>
              </>
            ) : hoveredSection === 'non-verified' ? (
              <>
                <span className="text-3xl font-bold text-gray-600">{nonVerified}</span>
                <span className="text-sm text-gray-500">Sin verificar</span>
                <span className="text-xs text-gray-400">{nonVerifiedPercentage}%</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-amber-600">{verifiedPercentage}%</span>
                <span className="text-sm text-gray-500">Verificados</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm font-medium text-gray-700">Verificados</span>
          </div>
          <span className="text-lg font-bold text-amber-600">{verifiedUsers}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-700">Sin verificar</span>
          </div>
          <span className="text-lg font-bold text-gray-600">{nonVerified}</span>
        </div>
      </div>
    </motion.div>
  );
};
