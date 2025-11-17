'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiStar, FiZap } from 'react-icons/fi';
import { useUserPlan } from '@/hooks/memberships';
import { usePlans } from '@/hooks/plans';

/**
 * Botón "Mejorar plan" con banner contextual
 * Estilo minimalista siguiendo el diseño del Hero de CONEXIA
 * @param {string} context - 'services' | 'projects' - Define el mensaje contextual
 */
export default function UpgradePlanButton({ context = 'general', className = '' }) {
  const { data, isLoading: userPlanLoading } = useUserPlan();
  const { plans, loading: plansLoading } = usePlans();

  const isLoading = userPlanLoading || plansLoading;
  const planName = data?.plan?.name || 'Free';
  
  // Obtener el plan siguiente (Basic si es Free, Premium si es Basic)
  const targetPlanName = planName === 'Free' ? 'Basic' : 'Premium';
  const targetPlan = useMemo(() => {
    return plans.find(p => p.name === targetPlanName);
  }, [plans, targetPlanName]);

  // Función para obtener el valor de un beneficio específico del plan objetivo
  const getTargetBenefit = useMemo(() => {
    return (benefitKey) => {
      if (!targetPlan?.benefits) return null;
      const benefit = targetPlan.benefits.find(b => b.key === benefitKey);
      return benefit?.value;
    };
  }, [targetPlan]);

  // Función para formatear la visibilidad
  const formatVisibility = (value) => {
    const visibilityMap = {
      'estandar': 'Estándar',
      'alta': 'Alta (prioridad media)',
      'prioridad_maxima': 'Prioridad máxima'
    };
    return visibilityMap[value] || value;
  };

  // Función para formatear métricas
  const formatMetrics = (value) => {
    const metricsMap = {
      'basicas': 'Básicas',
      'detalladas': 'Detalladas (visitas, clics)',
      'avanzadas': 'Avanzadas (impacto, engagement, ranking)'
    };
    return metricsMap[value] || value;
  };

  // Generar mensajes dinámicos basados en los beneficios reales del plan objetivo
  const getMessage = useMemo(() => {
    if (!targetPlan) {
      // Fallback si no se encuentra el plan objetivo
      return {
        highlight: `Mejora a ${targetPlanName}`,
        description: 'Aumenta tu visibilidad y accede a más beneficios'
      };
    }

    // Obtener beneficios específicos según el contexto
    const servicesLimit = getTargetBenefit('publish_services');
    const projectsLimit = getTargetBenefit('publish_projects');
    const visibility = getTargetBenefit('search_visibility');

    // Mensajes según el contexto
    if (context === 'services') {
      const highlight = servicesLimit 
        ? `Publica hasta ${servicesLimit} servicios`
        : `Mejora a ${targetPlanName}`;
      
      const description = 'Aumenta tu visibilidad y accede a más beneficios';

      return { highlight, description };
    }

    if (context === 'projects') {
      const highlight = projectsLimit 
        ? `Publica hasta ${projectsLimit} proyectos`
        : `Mejora a ${targetPlanName}`;
      
      const description = 'Aumenta tu visibilidad y oportunidades de colaboración';

      return { highlight, description };
    }

    // Contexto general
    return {
      highlight: `Mejora a ${targetPlanName}`,
      description: 'Desbloquea todas las funcionalidades y beneficios'
    };
  }, [targetPlan, targetPlanName, context, getTargetBenefit]);

  // No mostrar mientras carga
  if (isLoading) {
    return null;
  }
  
  // No mostrar si el usuario tiene plan Premium (último plan)
  if (planName === 'Premium') {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Banner compacto con diseño horizontal */}
      <div className="relative bg-gradient-to-r from-[#367d7d]/15 via-[#48a6a7]/20 to-[#367d7d]/15 border-2 border-[#48a6a7]/40 rounded-xl overflow-hidden shadow-md">
        {/* Efectos de fondo sutiles */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Contenido izquierdo - Información contextual */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
              {/* Icono decorativo */}
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#48a6a7]/20 to-[#367d7d]/20 border border-[#48a6a7]/30">
                <FiZap className="w-5 h-5 text-[#367d7d]" />
              </div>
              
              {/* Texto */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-semibold text-[#2b6a6a] mb-1">
                  Suscribite a {targetPlanName}
                </p>
                <p className="text-sm sm:text-base font-bold text-[#367d7d] leading-tight">
                  {getMessage.highlight}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                  {getMessage.description}
                </p>
              </div>
            </div>

            {/* Botón Mejorar plan - Destacado */}
            <div className="relative">
              {/* Resplandor dinámico detrás del botón */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#48a6a7]/30 via-[#419596]/40 to-[#367d7d]/30 rounded-xl blur-xl opacity-60 animate-pulse"></div>
              
              {/* Link como botón para permitir click derecho */}
              <Link
                href="/settings/my-plan#explorar-planes"
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-[0_4px_15px_rgba(72,166,167,0.4)] hover:shadow-[0_6px_20px_rgba(65,149,150,0.5)] transform hover:scale-105 group whitespace-nowrap"
              >
                {/* Icono estrella con animación */}
                <FiStar className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Mejorar plan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
