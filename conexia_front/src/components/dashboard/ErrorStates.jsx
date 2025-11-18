'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, RefreshCcw } from 'lucide-react';

/**
 * Convierte mensajes de error técnicos en mensajes amigables
 */
const getFriendlyErrorMessage = (technicalMessage) => {
  if (!technicalMessage) {
    return 'No pudimos cargar la información. Por favor, intenta nuevamente.';
  }

  const message = technicalMessage.toLowerCase();

  // Errores de red o conexión
  if (message.includes('cannot get') || message.includes('network') || message.includes('fetch')) {
    return 'No pudimos conectarnos con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
  }

  // Errores de autenticación
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }

  // Errores de permisos
  if (message.includes('forbidden') || message.includes('403')) {
    return 'No tienes permisos para acceder a esta información.';
  }

  // Errores de servidor
  if (message.includes('500') || message.includes('internal server')) {
    return 'Estamos experimentando problemas técnicos. Por favor, intenta más tarde.';
  }

  // Errores de timeout
  if (message.includes('timeout')) {
    return 'La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.';
  }

  // Si el mensaje ya es amigable, devolverlo tal cual
  return technicalMessage;
};

/**
 * Estado de error con opción de reintentar
 */
export const ErrorState = ({ message, onRetry }) => {
  const friendlyMessage = getFriendlyErrorMessage(message);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg p-12"
    >
      <div className="bg-red-50 rounded-full p-6 mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Error al cargar las métricas
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {friendlyMessage}
      </p>
      
        {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="
            flex items-center gap-2 px-6 py-3 
            bg-[#48a6a7] hover:bg-[#419596] 
            text-white font-semibold rounded-lg 
            transition-colors duration-200
            shadow-md hover:shadow-lg
          "
          aria-label="Reintentar carga de datos"
        >
          <RefreshCcw className="w-5 h-5" aria-hidden="true" />
          Reintentar
        </motion.button>
      )}
    </motion.div>
  );
};

/**
 * Estado vacío cuando no hay datos
 */
export const EmptyState = ({ message, actionLabel, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg p-12"
    >
      <div className="bg-gray-50 rounded-full p-6 mb-6">
        <BarChart3 className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Sin actividad registrada
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {message || 'Aún no tienes datos para mostrar. Comienza a interactuar en la plataforma para ver tus métricas.'}
      </p>
      
      {onAction && actionLabel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="
            px-6 py-3 
            bg-[#48a6a7] hover:bg-[#419596] 
            text-white font-semibold rounded-lg 
            transition-colors duration-200
            shadow-md hover:shadow-lg
          "
          aria-label={actionLabel}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};
