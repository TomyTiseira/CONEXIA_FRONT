'use client';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

/**
 * Header del dashboard con título y timestamp - Estilo Conexia
 */
export const DashboardHeader = ({ title, subtitle, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-2 relative"
    >
      {/* Fondo decorativo con gradiente Conexia */}
      <div className="absolute -left-4 -top-2 w-1 h-24 bg-gradient-to-b from-[#48a6a7] via-[#35ba5b] to-transparent rounded-full" />
      
      <div className="flex items-start gap-4">

        {/* Contenido del header */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#48a6a7] via-[#35ba5b] to-[#48a6a7] bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg text-gray-600 mb-3 font-medium">
              {subtitle}
            </p>
          )}
          
          {timestamp && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#edf6f6] rounded-full text-sm text-[#48a6a7] font-medium"
            >
              <Calendar className="w-4 h-4" />
              <span>
                Actualizado: {new Date(timestamp).toLocaleString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Línea decorativa inferior */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 h-1 bg-gradient-to-r from-[#48a6a7] via-[#35ba5b] to-transparent rounded-full origin-left"
      />
    </motion.div>
  );
};
