'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiStar, FiZap, FiAward } from 'react-icons/fi';
import { usePlan } from '@/hooks/plans/usePlans';
import { useUserPlan } from '@/hooks/memberships';

/**
 * Badge para mostrar el plan actual del usuario
 * Puede usarse en navbar, perfil, etc.
 * 
 * Ahora soporta: Free, Basic, Premium
 */
export default function PlanBadge({ 
  planId,
  planName,
  variant = 'default', // 'default' | 'compact' | 'icon-only'
  showUpgradeLink = true,
  className = '',
  useCurrentPlan = false, // Si es true, obtiene el plan del usuario autenticado
}) {
  const router = useRouter();
  
  // Si useCurrentPlan es true, obtener el plan del usuario autenticado
  const { data: currentUserPlan, isLoading: loadingUserPlan, error: userPlanError } = useCurrentPlan 
    ? useUserPlan() 
    : { data: null, isLoading: false, error: null };
  
  // Si se pasa planId, obtener el plan del hook
  const { plan: fetchedPlan, loading: loadingPlanById } = planId && !useCurrentPlan
    ? usePlan(planId) 
    : { plan: null, loading: false };
  
  const loading = loadingUserPlan || loadingPlanById;
  
  // Si hay error al cargar el plan del usuario, no mostrar nada
  if (useCurrentPlan && userPlanError) {
    return null;
  }

  // Si está cargando el plan del usuario y no hay datos, no mostrar nada
  if (useCurrentPlan && loadingUserPlan && !currentUserPlan) {
    return null;
  }
  
  // Determinar el nombre del plan
  let displayPlanName = planName;
  if (!displayPlanName && useCurrentPlan && currentUserPlan?.plan) {
    displayPlanName = currentUserPlan.plan.name;
  } else if (!displayPlanName && fetchedPlan) {
    displayPlanName = fetchedPlan.name;
  } else if (!displayPlanName) {
    displayPlanName = 'Free';
  }

  const handleClick = () => {
    if (showUpgradeLink) {
      router.push('/settings/my-plan');
    }
  };

  // Si está cargando y se pasó planId, mostrar estado de carga
  if (planId && loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 ${className}`}>
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500">Cargando...</span>
      </div>
    );
  }

  // Configuración de colores y estilos según el plan (Free, Basic, Premium)
  const planConfig = {
    'Free': {
      icon: FiStar,
      gradient: 'from-gray-400 to-gray-500',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-300',
      emoji: '⭐'
    },
    'Basic': {
      icon: FiZap,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      emoji: '⚡'
    },
    'Premium': {
      icon: FiAward,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
      emoji: '👑'
    }
  };

  const config = planConfig[displayPlanName] || planConfig['Free'];
  const Icon = config.icon;

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleClick}
        className={`
          w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient}
          flex items-center justify-center text-white
          hover:scale-110 transition-transform
          ${className}
        `}
        title={`Plan ${displayPlanName}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
          ${config.bg} ${config.text} border ${config.border}
          hover:shadow-md transition-all text-sm font-medium
          ${className}
        `}
      >
        <Icon className="w-3.5 h-3.5" />
        {displayPlanName}
      </button>
    );
  }

  // Variant 'default'
  return (
    <div className={`
      ${config.bg} border ${config.border} rounded-xl p-4
      ${className}
    `}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient}
            flex items-center justify-center text-white
          `}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Tu plan actual</p>
            <p className={`text-lg font-bold ${config.text}`}>
              {displayPlanName}
            </p>
          </div>
        </div>
        
        {showUpgradeLink && displayPlanName === 'Free' && (
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-gradient-to-r from-conexia-green to-[#1a7a66] text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            Mejorar
          </button>
        )}
        
        {showUpgradeLink && displayPlanName !== 'Free' && (
          <button
            onClick={handleClick}
            className="text-sm text-conexia-green hover:text-[#1a7a66] font-medium"
          >
            Ver detalles →
          </button>
        )}
      </div>
    </div>
  );
}

