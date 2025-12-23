'use client';
import { motion } from 'framer-motion';
import { AlertCircle, FileWarning } from 'lucide-react';

/**
 * Componente para mostrar el resumen general de reportes
 */
export const ReportsSummary = ({ reports }) => {
  if (!reports || reports.totalReports === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-500">No hay reportes en el sistema</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    'Activo': { bg: 'bg-amber-100', text: 'text-amber-800' },
    'En revisión': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Resuelto': { bg: 'bg-green-100', text: 'text-green-800' },
    'Desestimado': { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  return (
    <div className="space-y-6">
      {/* Resumen Total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">Resumen de Reportes</h3>
            <p className="text-sm text-gray-500">Total: {reports.totalReports} reportes</p>
          </div>
        </div>

        {/* Por Estado */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Por Estado</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reports.byStatus?.map((status, index) => {
              const colors = statusColors[status.status] || statusColors['Activo'];
              return (
                <div
                  key={index}
                  className={`${colors.bg} rounded-lg p-3 flex items-center justify-between`}
                >
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {status.status}
                  </span>
                  <span className={`text-xl font-bold ${colors.text}`}>
                    {status.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por Tipo */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Por Tipo</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reports.byType?.map((type, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {type.type}
                </span>
                <span className="text-lg font-bold text-gray-800 ml-2">
                  {type.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Por Razón */}
        {reports.byReason && reports.byReason.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Por Razón</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reports.byReason.map((reason, index) => {
                const percentage = ((reason.count / reports.totalReports) * 100).toFixed(1);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileWarning className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {reason.reason}
                    </span>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-gray-800">{reason.count}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
