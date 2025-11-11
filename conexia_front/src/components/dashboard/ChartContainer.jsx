'use client';
import { motion } from 'framer-motion';

/**
 * Contenedor base para gráficos con título y descripción
 */
export const ChartContainer = ({ title, description, children, className = '' }) => {
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
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      {/* Chart content */}
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
};
