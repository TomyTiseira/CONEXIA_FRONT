'use client';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

/**
 * Componente para mostrar reportes agrupados por estado y razón
 */
export const ReportsBreakdown = ({ reportType, reportData }) => {
  if (!reportData || reportData.total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{reportType}</h3>
            <p className="text-sm text-gray-500">No hay reportes</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    'pending': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendiente' },
    'in_review': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En revisión' },
    'resolved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Resuelto' },
    'dismissed': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Desestimado' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-red-50">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{reportType}</h3>
          <p className="text-sm text-gray-500">Total: {reportData.total} reportes</p>
        </div>
      </div>

      {/* Por Estado */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Por estado</h4>
        <div className="grid grid-cols-2 gap-3">
          {reportData.byStatus?.map((status, index) => {
            const colors = statusColors[status.status] || statusColors['pending'];
            return (
              <div
                key={index}
                className={`${colors.bg} rounded-lg p-3 flex items-center justify-between`}
              >
                <span className={`text-sm font-medium ${colors.text}`}>
                  {colors.label}
                </span>
                <span className={`text-xl font-bold ${colors.text}`}>
                  {status.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Por Razón */}
      {reportData.byReason && reportData.byReason.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Por razón</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reportData.byReason.map((reason, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {reason.reason}
                </span>
                <span className="text-sm font-bold text-gray-800 ml-2">
                  {reason.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
