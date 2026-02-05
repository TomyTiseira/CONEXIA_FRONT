'use client';

import React from 'react';
import { FiX, FiCheck, FiStar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { isBenefitActive, formatBenefitValue } from '@/utils/planFormatters';

/**
 * Modal para mostrar detalles completos de un plan
 */
export default function PlanDetailsModal({ 
  plan, 
  isOpen, 
  onClose,
  isCurrentPlan = false,
  billingCycle = 'monthly',
  canContract = true,
  onContractClick
}) {
  if (!isOpen || !plan) return null;

  const isFree = parseFloat(plan.monthlyPrice) === 0;
  const displayPrice = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice)
    : parseFloat(plan.annualPrice);

  // Agrupar beneficios por tipo usando la función helper
  const activeBenefits = plan.benefits?.filter(b => isBenefitActive(b.value)) || [];
  const inactiveBenefits = plan.benefits?.filter(b => !isBenefitActive(b.value)) || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {plan.name}
            </h2>
            {isCurrentPlan && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-conexia-green to-[#1a7a66] text-white text-xs font-bold rounded-full">
                <FiCheck className="w-3 h-3" />
                Tu plan actual
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Descripción */}
          {plan.description && (
            <div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {plan.description}
              </p>
            </div>
          )}

          {/* Precio */}
          <div className="bg-gradient-to-br from-conexia-soft/30 to-white border border-conexia-green/20 rounded-xl p-6">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-extrabold text-conexia-green">
                ${isFree ? '0' : displayPrice.toFixed(2)}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-gray-600 text-lg font-medium">
                  ARS
                </span>
                <span className="text-gray-500 text-sm">
                  / {billingCycle === 'monthly' ? 'mes' : 'año'}
                </span>
              </div>
            </div>
          </div>

          {/* Beneficios incluidos */}
          {activeBenefits.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCheck className="w-5 h-5 text-green-600" />
                Características incluidas
              </h3>
              <div className="space-y-3">
                {activeBenefits.map((benefit, index) => {
                  const isNumeric = typeof benefit.value === 'number';
                  const isString = typeof benefit.value === 'string';
                  const formattedValue = isString ? formatBenefitValue(benefit.key, benefit.value) : null;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <FiCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {benefit.name || benefit.key}
                          {isNumeric && benefit.value > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-conexia-green text-white text-xs font-bold rounded-full">
                              {benefit.value}{['publish_services', 'publish_projects', 'highlight_services'].includes(benefit.key) ? ' por mes' : ''}
                            </span>
                          )}
                          {isString && formattedValue && (
                            <span className="ml-2 px-2 py-0.5 bg-conexia-green text-white text-xs font-bold rounded-full">
                              {formattedValue}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Beneficios no incluidos */}
          {inactiveBenefits.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiX className="w-5 h-5 text-gray-400" />
                No incluido en este plan
              </h3>
              <div className="space-y-2">
                {inactiveBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg opacity-60"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                      <FiX className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {benefit.name || benefit.key}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cerrar
          </Button>
          
          {!isCurrentPlan && canContract && !isFree && (
            <Button
              onClick={() => {
                onContractClick?.(plan.id);
                onClose();
              }}
              className="flex-1 !bg-gradient-to-r !from-conexia-green !to-[#1a7a66] hover:!from-[#1a7a66] hover:!to-conexia-green !text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Contratar plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
