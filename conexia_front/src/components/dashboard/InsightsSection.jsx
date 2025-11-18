'use client';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Award } from 'lucide-react';

/**
 * Sección de insights personalizados basados en las métricas del usuario
 */
export const InsightsSection = ({ 
  successRate, 
  totalServicesHired, 
  totalRevenueGenerated,
  totalProjectsEstablished 
}) => {
  // Generar insights inteligentes
  const insights = [];

  // Insight sobre tasa de éxito
  if (successRate > 70) {
    insights.push({
      icon: Award,
      message: '¡Excelente! Tu tasa de éxito está por encima del promedio de la plataforma.',
      type: 'success',
    });
  } else if (successRate > 40) {
    insights.push({
      icon: TrendingUp,
      message: 'Buen desempeño. Sigue mejorando tu perfil para aumentar tus oportunidades.',
      type: 'info',
    });
  } else if (successRate > 0) {
    insights.push({
      icon: Lightbulb,
      message: 'Mejora tu perfil y portafolio para aumentar tus posibilidades de ser seleccionado.',
      type: 'warning',
    });
  }

  // Insight sobre servicios completados
  if (totalServicesHired > 0) {
    insights.push({
      icon: TrendingUp,
      message: `Has completado ${totalServicesHired} servicio${totalServicesHired > 1 ? 's' : ''} exitosamente. ¡Sigue así!`,
      type: 'success',
    });
  }

  // Insight sobre ingresos
  if (totalRevenueGenerated > 100000) {
    insights.push({
      icon: Award,
      message: `¡Felicitaciones! Has generado más de $${totalRevenueGenerated.toLocaleString('es-AR')} en la plataforma.`,
      type: 'success',
    });
  }

  // Insight sobre proyectos
  if (totalProjectsEstablished > 5) {
    insights.push({
      icon: Award,
      message: `Has establecido ${totalProjectsEstablished} colaboraciones exitosas. Eres un miembro valioso de la comunidad.`,
      type: 'success',
    });
  }

  // Si no hay insights, mostrar mensaje motivacional
  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      message: '¡Bienvenido! Comienza a postularte a proyectos para ver tus estadísticas crecer.',
      type: 'info',
    });
  }

  const typeColors = {
    success: {
      bg: 'bg-[#ebf8ef]',
      border: 'border-[#35ba5b]/30',
      icon: 'text-[#35ba5b]',
    },
    info: {
      bg: 'bg-[#edf6f6]',
      border: 'border-[#48a6a7]/30',
      icon: 'text-[#48a6a7]',
    },
    warning: {
      bg: 'bg-[#fefbe8]',
      border: 'border-[#f4d81d]/30',
      icon: 'text-[#b7a216]',
    },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colors = typeColors[insight.type];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`
                flex gap-4 p-4 rounded-lg border-2 ${colors.border} ${colors.bg}
                hover:shadow-md transition-all duration-300
              `}
            >
              <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {insight.message}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
