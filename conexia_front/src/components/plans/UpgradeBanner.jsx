'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiStar, FiArrowRight, FiZap } from 'react-icons/fi';
import { useUserPlan } from '@/hooks/memberships';
import { usePlans } from '@/hooks/plans';

/**
 * Banner para promover la mejora de plan
 * Puede usarse en Inicio, Perfil, etc.
 */
export default function UpgradeBanner({ 
  variant = 'default', // 'default' | 'compact' | 'minimal'
  showButton = true,
  className = ''
}) {
  const { data: userPlanData, isLoading: userPlanLoading } = useUserPlan();
  const { plans, loading: plansLoading } = usePlans();

  const isLoading = userPlanLoading || plansLoading;
  const planName = userPlanData?.plan?.name || 'Free';

  // Obtener el plan siguiente
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

  // Generar mensaje dinámico
  const getMessage = useMemo(() => {
    if (!targetPlan) {
      return {
        highlight: `Mejora tu plan`,
        description: 'Desbloquea más funcionalidades y beneficios'
      };
    }

    const servicesLimit = getTargetBenefit('publish_services');
    const projectsLimit = getTargetBenefit('publish_projects');

    // Mensaje combinado de servicios y proyectos
    const limits = [];
    if (servicesLimit) limits.push(`${servicesLimit} servicios`);
    if (projectsLimit) limits.push(`${projectsLimit} proyectos`);
    
    const highlight = limits.length > 0 
      ? `Publica hasta ${limits.join(' y ')}.`
      : 'Mejora tu plan';
    
    return {
      highlight,
      description: 'Aumenta tu visibilidad y accede a más beneficios'
    };
  }, [targetPlan, getTargetBenefit]);

  // No mostrar mientras carga
  if (isLoading) {
    return null;
  }

  // No mostrar si tiene Premium
  if (planName === 'Premium') {
    return null;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`w-full ${className}`}>
        {/* Banner horizontal similar al de solicitud de conexión */}
        <div className="relative w-full py-3 px-4 rounded-lg shadow-sm border border-[#c6e8d4] bg-gradient-to-r from-[#e6f7f7] via-[#f0f9f4] to-[#e6f7f7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          {/* Contenido del banner */}
          <div className="relative flex items-center gap-3 flex-1 justify-center sm:justify-start">
            {/* Icono destacado */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#48a6a7]/30 to-[#367d7d]/30 border border-[#48a6a7]/40 flex items-center justify-center shadow-sm">
              <FiZap className="w-5 h-5 text-[#367d7d]" />
            </div>
            
            {/* Texto del mensaje */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#367d7d] leading-snug">
                {getMessage.highlight}
              </p>
              <p className="text-xs text-[#367d7d]/80 mt-0.5">
                {getMessage.description}
              </p>
            </div>
          </div>
          
          {/* Botón de acción */}
          {showButton && (
            <div className="relative flex justify-center sm:justify-end">
              {/* Resplandor sutil detrás del botón */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#48a6a7]/20 via-[#419596]/30 to-[#367d7d]/20 rounded-lg blur-md opacity-70"></div>
              
              <Link
                href="/settings/my-plan"
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-md hover:shadow-lg transform hover:scale-105 group min-w-[140px]"
              >
                <FiStar className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Mejorar plan</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`w-full ${className}`}>
        {/* Banner compacto con diseño similar al UpgradePlanButton */}
        <div className="relative bg-gradient-to-r from-[#367d7d]/5 via-[#48a6a7]/8 to-[#367d7d]/5 border border-[#48a6a7]/20 rounded-xl overflow-hidden">
          {/* Efectos de fondo sutiles */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative px-4 py-3">
            <div className="flex flex-col gap-3">
              {/* Contenido superior */}
              <div className="flex items-start gap-2.5">
                {/* Icono decorativo más pequeño */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#48a6a7]/20 to-[#367d7d]/20 border border-[#48a6a7]/30 flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-[#367d7d]" />
                </div>
                
                {/* Texto simplificado */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#367d7d] leading-tight">
                    Aumenta tu visibilidad y accede a más beneficios
                  </p>
                </div>
              </div>
              
              {/* Botón Mejorar plan */}
              {showButton && (
                <div className="relative">
                  {/* Resplandor dinámico detrás del botón */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#48a6a7]/30 via-[#419596]/40 to-[#367d7d]/30 rounded-xl blur-xl opacity-60 animate-pulse"></div>
                  
                  {/* Link como botón para permitir click derecho */}
                  <Link
                    href="/settings/my-plan"
                    className="relative w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-[0_4px_15px_rgba(72,166,167,0.4)] hover:shadow-[0_6px_20px_rgba(65,149,150,0.5)] transform hover:scale-105 group"
                  >
                    {/* Icono estrella con animación */}
                    <FiStar className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Mejorar plan</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <Link
        href="/settings/my-plan"
        className={`
          w-full p-3 bg-gradient-to-r from-conexia-green/10 to-blue-500/10 
          border-2 border-dashed border-conexia-green/30
          rounded-lg hover:border-conexia-green hover:shadow-md transition-all block
          ${className}
        `}
      >
        <div className="flex items-center justify-center gap-2 text-conexia-green">
          <FiStar className="w-5 h-5" />
          <span className="font-semibold">Descubre nuestros planes Premium</span>
          <FiArrowRight className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  // Variant 'default'
  return (
    <div className={`
      relative overflow-hidden rounded-2xl shadow-2xl
      bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
      ${className}
    `}>
      {/* Patron de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-conexia-green rounded-full blur-3xl"></div>
      </div>

      <div className="relative px-8 py-12 md:px-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Contenido */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-semibold">
                <FiStar className="w-4 h-4" />
                Planes Premium
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Mejora tu plan y <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-conexia-green">
                  potencia tu negocio
                </span>
              </h2>
              
              <p className="text-gray-300 text-lg">
                Accede a funcionalidades avanzadas, analíticas detalladas y soporte prioritario
              </p>

              {/* Beneficios destacados */}
              <div className="flex flex-wrap gap-4 pt-4">
                {['Proyectos ilimitados', 'Analíticas avanzadas', 'Soporte 24/7'].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-200">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FiZap className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {showButton && (
                <div className="pt-6">
                  <Link
                    href="/settings/my-plan"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Ver todos los planes
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Ilustración/Icono */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-conexia-green rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <FiStar className="w-24 h-24 md:w-32 md:h-32 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
