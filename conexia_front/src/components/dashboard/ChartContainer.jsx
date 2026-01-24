'use client';
import { motion } from 'framer-motion';

/**
 * Contenedor base para gráficos con título, descripción e icono
 */
export const ChartContainer = ({ title, description, icon: Icon, iconColor = 'purple', children, className = '' }) => {
  const iconColorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-[#48a6a7]/30 transition-all duration-300 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="mb-6">
        {Icon ? (
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${iconColorClasses[iconColor]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </>
        )}
      </div>

      {/* Chart content */}
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
};
