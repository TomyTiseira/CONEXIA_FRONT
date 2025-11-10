'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { useUserPlan } from '@/hooks/memberships';

/**
 * Banner de comparación de planes
 * Muestra al usuario los beneficios de actualizar su plan
 * 
 * @param {string} context - 'services' | 'projects' | 'general'
 * @param {string} className - Clases CSS adicionales
 */
export default function PlanComparisonBanner({ 
  context = 'general',
  className = '' 
}) {
  const { data, isLoading } = useUserPlan();

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  const planName = data?.plan?.name || 'Free';
  const isFreePlan = data?.isFreePlan ?? true;

  // Mensajes personalizados según el contexto
  const messages = {
    services: {
      Free: {
        title: '🚀 Destaca tus servicios con Basic',
        description: 'Publica servicios destacados y aumenta tu visibilidad',
        benefits: ['Servicios destacados', 'Mayor alcance', 'Estadísticas avanzadas']
      },
      Basic: {
        title: '⭐ Lleva tu negocio al siguiente nivel con Premium',
        description: 'Accede a todas las herramientas profesionales',
        benefits: ['Servicios ilimitados destacados', 'Soporte prioritario', 'Análisis detallados']
      }
    },
    projects: {
      Free: {
        title: '💼 Accede a más proyectos con Basic',
        description: 'Postúlate a proyectos ilimitados y aumenta tus oportunidades',
        benefits: ['Postulaciones ilimitadas', 'Prioridad en búsquedas', 'Acceso a proyectos premium']
      },
      Basic: {
        title: '👑 Maximiza tus oportunidades con Premium',
        description: 'Destacate en todas las búsquedas y recibe invitaciones directas',
        benefits: ['Badge Premium visible', 'Invitaciones directas a proyectos', 'Sin comisiones adicionales']
      }
    },
    general: {
      Free: {
        title: '✨ Mejora tu experiencia con Basic',
        description: 'Accede a más beneficios y mejora tu perfil profesional',
        benefits: ['Perfil destacado', 'Más visibilidad', 'Herramientas avanzadas']
      },
      Basic: {
        title: '🎯 Desbloquea todo el potencial con Premium',
        description: 'Obtén acceso completo a todas las funcionalidades',
        benefits: ['Sin límites', 'Máxima visibilidad', 'Soporte VIP']
      }
    }
  };

  // No mostrar banner si ya tiene Premium
  if (planName === 'Premium') {
    return null;
  }

  const message = messages[context]?.[planName] || messages.general[planName];
  const targetPlan = planName === 'Free' ? 'Basic' : 'Premium';

  // Configuración del icono y badge del plan actual
  const planBadge = {
    Free: { emoji: '⭐', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    Basic: { emoji: '⚡', color: 'bg-blue-100 text-blue-700 border-blue-300' }
  };

  const currentBadge = planBadge[planName] || planBadge.Free;

  return (
    <div className={`
      bg-gradient-to-r 
      ${planName === 'Free' ? 'from-blue-50 to-blue-100' : 'from-amber-50 to-amber-100'}
      border-2 
      ${planName === 'Free' ? 'border-blue-200' : 'border-amber-200'}
      rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow
      ${className}
    `}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {/* Badge del plan actual */}
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-600 mr-2">Tu plan actual:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-xs ${currentBadge.color}`}>
              <span>{currentBadge.emoji}</span>
              {planName}
            </span>
          </div>
          
          <h3 className={`
            font-bold text-lg mb-2
            ${planName === 'Free' ? 'text-blue-900' : 'text-amber-900'}
          `}>
            {message.title}
          </h3>
          <p className={`
            text-sm mb-3
            ${planName === 'Free' ? 'text-blue-700' : 'text-amber-700'}
          `}>
            {message.description}
          </p>
          <ul className="space-y-1">
            {message.benefits.map((benefit, idx) => (
              <li key={idx} className={`
                flex items-center gap-2 text-sm
                ${planName === 'Free' ? 'text-blue-800' : 'text-amber-800'}
              `}>
                <FiCheck className="w-4 h-4 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-shrink-0">
          <Link
            href="/settings/my-plan"
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-lg
              font-semibold text-white shadow-md hover:shadow-lg
              transition-all transform hover:scale-105
              ${planName === 'Free' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              }
            `}
          >
            Explorar planes
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
