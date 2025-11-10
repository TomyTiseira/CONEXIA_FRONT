'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiStar, FiArrowRight, FiZap } from 'react-icons/fi';
import { useUserPlan } from '@/hooks/memberships';

/**
 * Banner para promover la mejora de plan
 * Puede usarse en Inicio, Perfil, etc.
 */
export default function UpgradeBanner({ 
  variant = 'default', // 'default' | 'compact' | 'minimal'
  showButton = true,
  className = ''
}) {
  const router = useRouter();
  const { data: userPlanData, isLoading } = useUserPlan();

  const handleUpgrade = () => {
    router.push('/settings/my-plan#explorar-planes');
  };

  if (variant === 'compact') {
    const planName = userPlanData?.plan?.name || 'Free';
    const planEmoji = planName === 'Free' ? '⭐' : planName === 'Basic' ? '⚡' : '👑';
    
    return (
      <div className={`
        bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 shadow-lg
        ${className}
      `}>
        <div className="flex flex-col gap-3">
          {/* Plan actual - alineado a la izquierda */}
          {!isLoading && (
            <p className="text-blue-200/70 text-xs leading-tight">
              Tu plan actual: <span className="font-semibold text-white">{planName} {planEmoji}</span>
            </p>
          )}
          
          {/* Contenido superior */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                Desbloquea más funcionalidades
              </p>
              <p className="text-blue-100 text-xs mt-1 leading-tight">
                Mejora tu plan y accede a beneficios exclusivos
              </p>
            </div>
          </div>
          
          {/* Botón */}
          {showButton && (
            <button
              onClick={handleUpgrade}
              className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Explorar planes
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleUpgrade}
        className={`
          w-full p-3 bg-gradient-to-r from-conexia-green/10 to-blue-500/10 
          border-2 border-dashed border-conexia-green/30
          rounded-lg hover:border-conexia-green hover:shadow-md transition-all
          ${className}
        `}
      >
        <div className="flex items-center justify-center gap-2 text-conexia-green">
          <FiStar className="w-5 h-5" />
          <span className="font-semibold">Descubre nuestros planes Premium</span>
          <FiArrowRight className="w-4 h-4" />
        </div>
      </button>
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
                  <button
                    onClick={handleUpgrade}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Ver todos los planes
                    <FiArrowRight className="w-5 h-5" />
                  </button>
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
