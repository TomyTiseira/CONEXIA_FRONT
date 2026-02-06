'use client';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Ban,
  Timer
} from 'lucide-react';

/**
 * Mapeo de estados a configuración visual
 */
const statusConfig = {
  activo: {
    label: 'Activas',
    icon: Clock,
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-500',
  },
  pendiente_evaluacion: {
    label: 'Pendiente de Evaluación',
    icon: AlertCircle,
    color: 'yellow',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
    iconClass: 'text-yellow-500',
  },
  evaluacion_expirada: {
    label: 'Evaluación Expirada',
    icon: Timer,
    color: 'orange',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    iconClass: 'text-orange-500',
  },
  aceptada: {
    label: 'Aceptadas',
    icon: CheckCircle,
    color: 'green',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    iconClass: 'text-green-500',
  },
  rechazada: {
    label: 'Rechazadas',
    icon: XCircle,
    color: 'red',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    iconClass: 'text-red-500',
  },
  cancelada: {
    label: 'Canceladas',
    icon: Ban,
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
    iconClass: 'text-gray-500',
  },
  cancelada_moderacion: {
    label: 'Canceladas por Moderación',
    icon: Ban,
    color: 'purple',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    iconClass: 'text-purple-500',
  },
};

/**
 * Componente para mostrar desglose de postulaciones por estado
 * @param {Object} props
 * @param {Object} props.byStatus - Objeto con contadores por estado
 * @param {boolean} [props.compact] - Modo compacto (solo badges)
 */
export const StatusBreakdown = ({ byStatus, compact = false }) => {
  if (!byStatus) return null;

  // Filtrar solo estados con valores > 0
  const activeStatuses = Object.entries(byStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      config: statusConfig[status] || statusConfig.activo,
    }));

  if (activeStatuses.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        No hay postulaciones registradas
      </div>
    );
  }

  if (compact) {
    // Modo compacto: badges inline
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {activeStatuses.map(({ status, count, config }) => {
          const Icon = config.icon;
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full
                ${config.bgClass} ${config.borderClass} border
              `}
            >
              <Icon className={`w-4 h-4 ${config.iconClass}`} />
              <span className={`font-semibold text-sm ${config.textClass}`}>
                {count}
              </span>
              <span className="text-xs text-gray-600">{config.label}</span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Modo completo: tarjetas con detalles
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {activeStatuses.map(({ status, count, config }, index) => {
        const Icon = config.icon;
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`
              relative overflow-hidden rounded-lg border
              ${config.bgClass} ${config.borderClass}
              p-4 transition-all duration-200
              hover:shadow-md hover:scale-105
            `}
          >
            {/* Icono de fondo decorativo */}
            <div className="absolute top-0 right-0 opacity-10 -mr-2 -mt-2">
              <Icon className="w-16 h-16" />
            </div>

            {/* Contenido */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${config.iconClass}`} />
              </div>
              <div className={`text-2xl font-bold ${config.textClass} mb-1`}>
                {count}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {config.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
