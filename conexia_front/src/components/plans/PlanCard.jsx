'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';
import { isBenefitActive, formatBenefitValue } from '@/utils/planFormatters';

/**
 * Componente de tarjeta para mostrar un plan de suscripción
 */
export default function PlanCard({
  plan,
  isCurrentPlan = false,
  isMostPopular = false,
  billingCycle = 'monthly',
  canContract = true,
  onContractClick,
  onDetailsClick,
  currentPlanName = 'Free', // Nombre del plan actual del usuario
}) {
  // Determinar si es plan gratuito
  const isFree = parseFloat(plan.monthlyPrice) === 0;

  // Obtener precio según ciclo de facturación (directamente del backend)
  const displayPrice = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice)
    : parseFloat(plan.annualPrice);

  // Función para obtener el nivel jerárquico de un plan
  const getPlanTier = (planName) => {
    const tiers = {
      'Free': 1,
      'Basic': 2,
      'Premium': 3
    };
    return tiers[planName] || 0;
  };

  // Determinar si el plan actual es superior a este plan (downgrade no permitido)
  const isDowngrade = getPlanTier(currentPlanName) > getPlanTier(plan.name);
  
  // No permitir contratar planes inferiores
  const canContractThisPlan = canContract && !isDowngrade;

  return (
    <div 
      className={`
        relative rounded-2xl border-2 p-6 transition-all duration-300 flex flex-col
        ${isCurrentPlan 
          ? 'border-conexia-green bg-gradient-to-br from-conexia-soft/30 via-white to-white shadow-xl' 
          : isMostPopular
          ? 'border-[#48a6a7] bg-gradient-to-br from-[#367d7d]/5 via-[#48a6a7]/8 to-white shadow-[0_8px_30px_rgba(72,166,167,0.3)] hover:shadow-[0_10px_40px_rgba(72,166,167,0.4)] hover:scale-[1.02]'
          : plan.name === 'Premium'
          ? 'border-[#367d7d] bg-gradient-to-br from-[#48a6a7]/10 via-[#edf6f6] to-white shadow-[0_8px_30px_rgba(54,125,125,0.25)] hover:shadow-[0_10px_40px_rgba(54,125,125,0.35)] hover:scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-conexia-green/50 hover:shadow-lg hover:scale-[1.02]'
        }
      `}
    >
      {/* Badges superiores */}
      {(isMostPopular || isCurrentPlan || plan.name === 'Premium') && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {isMostPopular && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white text-xs font-bold rounded-full shadow-[0_4px_15px_rgba(72,166,167,0.4)]">
              <FiStar className="w-3 h-3" />
              MÁS POPULAR
            </span>
          )}
          {isCurrentPlan && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-conexia-green to-[#1a7a66] text-white text-xs font-bold rounded-full shadow-md">
              <FiCheck className="w-3 h-3" />
              TU PLAN ACTUAL
            </span>
          )}
          {plan.name === 'Premium' && !isCurrentPlan && !isMostPopular && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#367d7d] to-[#2b6a6a] text-white text-xs font-bold rounded-full shadow-[0_4px_15px_rgba(54,125,125,0.4)]">
              <FiStar className="w-3 h-3" />
              PREMIUM
            </span>
          )}
        </div>
      )}

      {/* Nombre del plan */}
      <div className="text-center mt-2 mb-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {plan.name}
        </h3>
      </div>

      {/* Precio */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-4xl font-extrabold text-conexia-green">
            ${isFree ? '0' : displayPrice.toFixed(2)}
          </span>
          <div className="flex flex-col items-start">
            <span className="text-gray-600 text-sm font-medium">
              ARS
            </span>
            <span className="text-gray-500 text-xs">
              / {billingCycle === 'monthly' ? 'mes' : 'año'}
            </span>
          </div>
        </div>
        
        {billingCycle === 'annual' && !isFree && (
          <p className="text-xs text-gray-500">
            Facturado anualmente
          </p>
        )}
      </div>

      {/* Beneficios */}
      <div className="space-y-3 mb-6 flex-grow">
        {plan.benefits && plan.benefits.map((benefit, index) => {
          const isActive = isBenefitActive(benefit.value);
          const isNumeric = typeof benefit.value === 'number';
          const isString = typeof benefit.value === 'string';
          const formattedValue = isString ? formatBenefitValue(benefit.key, benefit.value) : null;
          
          return (
            <div 
              key={index}
              className="flex items-start gap-2"
            >
              <div className={`
                mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center
                ${isActive 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {isActive ? (
                  <FiCheck className="w-3 h-3" />
                ) : (
                  <FiX className="w-3 h-3" />
                )}
              </div>
              <span className={`
                text-xs flex-1
                ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}
              `}>
                {benefit.name || benefit.key}
                {isNumeric && benefit.value > 0 && (
                  <span className="ml-1 font-bold text-conexia-green">
                    ({benefit.value})
                  </span>
                )}
                {isString && formattedValue && (
                  <span className="ml-1 font-bold text-conexia-green">
                    ({formattedValue})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="space-y-2 mt-auto">
        {isCurrentPlan ? (
          <Button 
            variant="outline"
            disabled
            className="w-full !bg-gray-50 !text-gray-500 !border-gray-300 !cursor-not-allowed !py-2.5"
          >
            Plan Actual
          </Button>
        ) : canContractThisPlan && !isFree ? (
          <Button 
            onClick={() => onContractClick?.(plan.id)}
            className={`
              w-full !py-2.5
              ${isMostPopular 
                ? '!bg-gradient-to-r !from-[#48a6a7] !to-[#419596] hover:!from-[#419596] hover:!to-[#367d7d]' 
                : plan.name === 'Premium'
                ? '!bg-gradient-to-r !from-[#367d7d] !to-[#2b6a6a] hover:!from-[#2b6a6a] hover:!to-[#204b4b]'
                : '!bg-gradient-to-r !from-conexia-green !to-[#1a7a66] hover:!from-[#1a7a66] hover:!to-conexia-green'
              }
              !text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300
            `}
          >
            Contratar Plan
          </Button>
        ) : !canContractThisPlan && isDowngrade ? (
          // Mostrar solo el botón de ver detalles si es un downgrade
          null
        ) : !canContract ? (
          <Button 
            variant="outline"
            disabled
            className="w-full !bg-gray-50 !text-gray-500 !border-gray-300 !cursor-not-allowed !py-2.5"
          >
            No disponible
          </Button>
        ) : null}

        {onDetailsClick && (
          <button
            onClick={() => onDetailsClick(plan.id)}
            className="w-full py-2.5 px-4 text-xs font-medium text-conexia-green hover:text-white border border-conexia-green hover:bg-conexia-green rounded-lg transition-all duration-200"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
}
