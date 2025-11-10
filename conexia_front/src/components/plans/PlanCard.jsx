'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';

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
}) {
  // Determinar si es plan gratuito
  const isFree = parseFloat(plan.monthlyPrice) === 0;

  // Obtener precio según ciclo de facturación (directamente del backend)
  const displayPrice = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice)
    : parseFloat(plan.annualPrice);

  return (
    <div 
      className={`
        relative rounded-2xl border-2 p-6 transition-all duration-300 flex flex-col
        ${isCurrentPlan 
          ? 'border-conexia-green bg-gradient-to-br from-conexia-soft/30 via-white to-white shadow-xl' 
          : isMostPopular
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-white to-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-conexia-green/50 hover:shadow-lg hover:scale-[1.02]'
        }
      `}
    >
      {/* Badges superiores */}
      {(isMostPopular || isCurrentPlan) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {isMostPopular && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-full shadow-md">
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
          const isActive = benefit.value === true || (typeof benefit.value === 'number' && benefit.value > 0);
          const isNumeric = typeof benefit.value === 'number';
          
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
        ) : canContract && !isFree ? (
          <Button 
            onClick={() => onContractClick?.(plan.id)}
            className={`
              w-full !py-2.5
              ${isMostPopular 
                ? '!bg-gradient-to-r !from-blue-600 !to-blue-500 hover:!from-blue-700 hover:!to-blue-600' 
                : '!bg-gradient-to-r !from-conexia-green !to-[#1a7a66] hover:!from-[#1a7a66] hover:!to-conexia-green'
              }
              !text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300
            `}
          >
            Contratar Plan
          </Button>
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
