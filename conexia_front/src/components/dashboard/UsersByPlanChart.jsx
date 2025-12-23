'use client';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useState } from 'react';

/**
 * Gráfico de usuarios por plan de membresía
 */
export const UsersByPlanChart = ({ usersByPlan = [] }) => {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  if (!usersByPlan || usersByPlan.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Usuarios por Plan</h3>
            <p className="text-sm text-gray-500">Distribución de membresías</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          No hay datos de membresías
        </div>
      </div>
    );
  }

  const totalUsers = usersByPlan.reduce((sum, plan) => sum + (plan.usersCount || plan.activeUsers || 0), 0);
  
  const planColors = {
    'Free': { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-600' },
    'Basic': { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    'Premium': { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-blue-50">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Usuarios por Plan</h3>
          <p className="text-sm text-gray-500">Total: {totalUsers} usuarios</p>
        </div>
      </div>

      {/* Gráfico de pastel */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-56 h-56">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {usersByPlan.map((plan, index) => {
              const userCount = plan.usersCount || plan.activeUsers || 0;
              const percentage = totalUsers > 0 ? (userCount / totalUsers) * 100 : 0;
              const previousPercentages = usersByPlan
                .slice(0, index)
                .reduce((sum, p) => {
                  const pCount = p.usersCount || p.activeUsers || 0;
                  return sum + (totalUsers > 0 ? (pCount / totalUsers) * 100 : 0);
                }, 0);
              
              const color = planColors[plan.planName]?.bg.replace('bg-', '') || 'gray-500';
              const strokeColor = {
                'gray-500': '#6B7280',
                'blue-500': '#3B82F6',
                'purple-500': '#A855F7',
              }[color] || '#6B7280';

              const isHovered = hoveredPlan === index;

              return (
                <circle
                  key={plan.planId || index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isHovered ? "22" : "20"}
                  strokeDasharray={`${percentage * 2.51327} 251.327`}
                  strokeDashoffset={-previousPercentages * 2.51327}
                  onMouseEnter={() => setHoveredPlan(index)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease',
                    opacity: hoveredPlan === null || isHovered ? 1 : 0.6
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredPlan !== null ? (
              <>
                <span className="text-2xl font-bold text-gray-800">
                  {usersByPlan[hoveredPlan]?.usersCount || usersByPlan[hoveredPlan]?.activeUsers || 0}
                </span>
                <span className="text-sm text-gray-500">{usersByPlan[hoveredPlan]?.planName}</span>
                <span className="text-xs text-gray-400">
                  {totalUsers > 0 ? (((usersByPlan[hoveredPlan]?.usersCount || 0) / totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-800">{totalUsers}</span>
                <span className="text-sm text-gray-500">Usuarios</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        {usersByPlan.map((plan, index) => {
          const userCount = plan.usersCount || plan.activeUsers || 0;
          const percentage = totalUsers > 0 ? ((userCount / totalUsers) * 100).toFixed(1) : '0.0';
          const colors = planColors[plan.planName] || planColors['Free'];
          
          return (
            <div
              key={plan.planId || index}
              className={`flex items-center justify-between p-3 ${colors.light} rounded-lg`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                <span className="text-sm font-medium text-gray-700">{plan.planName}</span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${colors.text}`}>{userCount}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
