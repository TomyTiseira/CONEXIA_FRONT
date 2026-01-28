'use client';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';

/**
 * Gráfico de barras para usuarios verificados vs no verificados
 */
export const UsersVerificationChart = ({ verifiedUsers, totalUsers }) => {
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
          <h3 className="text-lg font-bold text-gray-800">Estado de verificación</h3>
          <p className="text-sm text-gray-500">Usuarios verificados</p>
        </div>
      </div>

      {/* Gráfico de barras horizontales */}
      <div className="space-y-6">
        {/* Barra de usuarios verificados */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Verificados</span>
            <span className="text-sm font-bold text-amber-600">{verifiedUsers} ({verifiedPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verifiedPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-end pr-3"
            >
              {verifiedPercentage > 10 && (
                <span className="text-xs font-bold text-white">{verifiedPercentage}%</span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Barra de usuarios no verificados */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">No verificados</span>
            <span className="text-sm font-bold text-gray-600">{nonVerified} ({nonVerifiedPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nonVerifiedPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-end pr-3"
            >
              {nonVerifiedPercentage > 10 && (
                <span className="text-xs font-bold text-white">{nonVerifiedPercentage}%</span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resumen total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total de usuarios</span>
          <span className="text-xl font-bold text-gray-800">{totalUsers}</span>
        </div>
      </div>
    </motion.div>
  );
};
