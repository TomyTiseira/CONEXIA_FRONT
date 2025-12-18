'use client';
import { motion } from 'framer-motion';

/**
 * Componente wrapper para agrupar métricas en secciones con título
 * @param {Object} props
 * @param {string} props.title - Título de la sección
 * @param {string} [props.subtitle] - Subtítulo opcional
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @param {React.ReactNode} [props.icon] - Icono opcional para el título
 * @param {string} [props.iconColor] - Color del icono (blue, green, purple, etc.)
 */
export const DashboardSection = ({ 
  title, 
  subtitle, 
  children, 
  icon: Icon,
  iconColor = 'blue' 
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-[#edf6f6]',
      text: 'text-[#48a6a7]',
      border: 'border-[#48a6a7]/20',
    },
    green: {
      bg: 'bg-[#ebf8ef]',
      text: 'text-[#35ba5b]',
      border: 'border-[#35ba5b]/20',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
    },
    gold: {
      bg: 'bg-[#fefbe8]',
      text: 'text-[#b7a216]',
      border: 'border-[#f4d81d]/20',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
  };

  const colors = colorMap[iconColor] || colorMap.blue;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header de la sección */}
      <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Contenido de la sección */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.section>
  );
};
