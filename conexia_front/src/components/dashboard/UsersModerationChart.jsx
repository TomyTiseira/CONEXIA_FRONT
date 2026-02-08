'use client';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico de usuarios por estado de moderación
 */
export const UsersModerationChart = ({ activeUsers, suspendedUsers, bannedUsers }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  
  const total = activeUsers + suspendedUsers + bannedUsers;
  const activePercentage = total > 0 ? ((activeUsers / total) * 100).toFixed(1) : 0;
  const suspendedPercentage = total > 0 ? ((suspendedUsers / total) * 100).toFixed(1) : 0;
  const bannedPercentage = total > 0 ? ((bannedUsers / total) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-50">
          <Shield className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Estado de moderación</h3>
          <p className="text-sm text-gray-500">Usuarios por estado</p>
        </div>
      </div>

      {/* Gráfico de dona */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Activos (verde) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#35ba5b"
              strokeWidth={hoveredSection === 'active' ? "22" : "20"}
              strokeDasharray={`${activePercentage * 2.51327} 251.327`}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('active')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'active' ? 1 : 0.6
              }}
            />
            {/* Suspendidos (amarillo) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#F59E0B"
              strokeWidth={hoveredSection === 'suspended' ? "22" : "20"}
              strokeDasharray={`${suspendedPercentage * 2.51327} 251.327`}
              strokeDashoffset={`-${activePercentage * 2.51327}`}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('suspended')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'suspended' ? 1 : 0.6
              }}
            />
            {/* Baneados (rojo) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#db3228"
              strokeWidth={hoveredSection === 'banned' ? "22" : "20"}
              strokeDasharray={`${bannedPercentage * 2.51327} 251.327`}
              strokeDashoffset={`-${(activePercentage + suspendedPercentage) * 2.51327}`}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredSection('banned')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ 
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease',
                opacity: hoveredSection === null || hoveredSection === 'banned' ? 1 : 0.6
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSection === 'active' ? (
              <>
                <span className="text-3xl font-bold text-green-600">{activeUsers}</span>
                <span className="text-sm text-gray-500">Activos</span>
                <span className="text-xs text-gray-400">{activePercentage}%</span>
              </>
            ) : hoveredSection === 'suspended' ? (
              <>
                <span className="text-3xl font-bold text-amber-600">{suspendedUsers}</span>
                <span className="text-sm text-gray-500">Suspendidos</span>
                <span className="text-xs text-gray-400">{suspendedPercentage}%</span>
              </>
            ) : hoveredSection === 'banned' ? (
              <>
                <span className="text-3xl font-bold text-red-600">{bannedUsers}</span>
                <span className="text-sm text-gray-500">Baneados</span>
                <span className="text-xs text-gray-400">{bannedPercentage}%</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-800">{total}</span>
                <span className="text-sm text-gray-500">Total</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">Sin sanciones</span>
          </div>
          <span className="text-lg font-bold text-green-600">{activeUsers}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm font-medium text-gray-700">Suspendidos</span>
          </div>
          <span className="text-lg font-bold text-amber-600">{suspendedUsers}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-gray-700">Baneados</span>
          </div>
          <span className="text-lg font-bold text-red-600">{bannedUsers}</span>
        </div>
      </div>
    </motion.div>
  );
};
