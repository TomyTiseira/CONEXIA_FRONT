'use client';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, DollarSign } from 'lucide-react';

/**
 * Card explicativo para servicios completados
 */
export const CompletedServicesCard = ({ totalServicesHired, totalRevenue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-100">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Servicios Completados</h3>
          <p className="text-sm text-green-700">
            ✅ Servicios finalizados exitosamente
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Total</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{totalServicesHired}</div>
          <div className="text-xs text-gray-500 mt-1">servicios</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Ingresos</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${(totalRevenue / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-500 mt-1">ARS generados</div>
        </div>
      </div>

      {/* Ingreso promedio por servicio */}
      {totalServicesHired > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Ingreso promedio</span>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${(totalRevenue / totalServicesHired).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500">por servicio</div>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
        <p className="text-xs text-gray-700">
          <strong className="text-green-700">ℹ️ Importante:</strong> Solo se cuentan servicios con estado <strong className="font-mono text-xs bg-green-100 px-1 py-0.5 rounded">COMPLETED</strong>. Los ingresos corresponden únicamente a servicios finalizados exitosamente.
        </p>
      </div>
    </motion.div>
  );
};
