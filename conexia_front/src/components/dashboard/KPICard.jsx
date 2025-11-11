'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * Tarjeta de KPI con animaciones y efectos visuales
 * @param {Object} props
 * @param {string} props.title - Título de la métrica
 * @param {string|number} props.value - Valor principal
 * @param {LucideIcon} props.icon - Icono de Lucide React
 * @param {string} props.color - Color del tema (blue, green, purple, gold, red)
 * @param {string} [props.trend] - Texto de tendencia opcional
 * @param {string} [props.subtitle] - Subtítulo opcional
 * @param {boolean} [props.showProgressBar] - Mostrar barra de progreso
 * @param {number} [props.progressValue] - Valor de progreso (0-100)
 */
export const KPICard = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  showProgressBar = false,
  progressValue = 0,
}) => {
  // Mapeo de colores basado en la paleta de Conexia
  const colorMap = {
    blue: {
      bg: 'bg-[#edf6f6]',
      hover: 'hover:bg-[#e4f2f2]',
      text: 'text-[#48a6a7]',
      icon: 'text-[#48a6a7]',
      progress: 'bg-[#48a6a7]',
      border: 'border-[#48a6a7]/20',
    },
    green: {
      bg: 'bg-[#ebf8ef]',
      hover: 'hover:bg-[#e1f5e6]',
      text: 'text-[#35ba5b]',
      icon: 'text-[#35ba5b]',
      progress: 'bg-[#35ba5b]',
      border: 'border-[#35ba5b]/20',
    },
    purple: {
      bg: 'bg-purple-50',
      hover: 'hover:bg-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-600',
      progress: 'bg-purple-600',
      border: 'border-purple-200',
    },
    gold: {
      bg: 'bg-[#fefbe8]',
      hover: 'hover:bg-[#fdf9dd]',
      text: 'text-[#f4d81d]',
      icon: 'text-[#b7a216]',
      progress: 'bg-[#f4d81d]',
      border: 'border-[#f4d81d]/20',
    },
    red: {
      bg: 'bg-[#fbebea]',
      hover: 'hover:bg-[#fae0df]',
      text: 'text-[#db3228]',
      icon: 'text-[#db3228]',
      progress: 'bg-[#db3228]',
      border: 'border-[#db3228]/20',
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl border-2 ${colors.border}
        bg-white shadow-lg ${colors.hover}
        transition-all duration-300 p-6
      `}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      {/* Fondo decorativo */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full -mr-16 -mt-16 opacity-50`} />
      
      <div className="relative z-10">
        {/* Header con icono */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          {trend && (
            <span className="text-xs text-gray-500 font-medium">{trend}</span>
          )}
        </div>

        {/* Valor principal con animación de conteo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          className={`text-4xl font-bold ${colors.text} mb-2`}
          aria-live="polite"
        >
          {value}
        </motion.div>

        {/* Título */}
        <h3 className="text-gray-700 font-medium text-sm mb-1">{title}</h3>

        {/* Subtítulo */}
        {subtitle && (
          <p className="text-gray-500 text-xs">{subtitle}</p>
        )}

        {/* Barra de progreso */}
        {showProgressBar && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                className={`h-full ${colors.progress} rounded-full`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
