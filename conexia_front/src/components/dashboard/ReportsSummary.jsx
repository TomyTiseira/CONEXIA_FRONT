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
    'Activo': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    'Resuelto': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    'En revisión': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    'Desestimado': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
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
            <h3 className="text-lg font-bold text-gray-800">Resumen de reportes</h3>
            <p className="text-sm text-gray-500">
              Total: {reports.totalReports} reportes 
              {reports.activeReports !== undefined && reports.resolvedReports !== undefined && (
                <span className="ml-2">
                  ({reports.activeReports} activos • {reports.resolvedReports} resueltos)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Por Estado */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Por estado</h4>
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
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Por tipo</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reports.byType?.map((type, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1">
                    {type.type}
                  </span>
                  <span className="text-lg font-bold text-gray-800 ml-2">
                    {type.count}
                  </span>
                </div>
                {type.active !== undefined && type.resolved !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-700 font-medium">
                      {type.active} activos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-700 font-medium">
                      {type.resolved} resueltos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Por Razón */}
        {reports.byReason && reports.byReason.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Por razón</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reports.byReason.map((reason, index) => {
                const percentage = ((reason.count / reports.totalReports) * 100).toFixed(1);
                const hasDesglose = reason.active !== undefined && reason.resolved !== undefined;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <FileWarning className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 truncate mb-1">
                        {reason.reason}
                      </div>
                      {hasDesglose && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-amber-700 font-medium">
                            {reason.active} activos
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-700 font-medium">
                            {reason.resolved} resueltos
                          </span>
                        </div>
                      )}
                    </div>
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
