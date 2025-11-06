'use client';

import React from 'react';

/**
 * Toggle para cambiar entre ciclo de facturación mensual y anual
 */
export default function PricingToggle({ value = 'monthly', onChange }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-full">
        <button
          onClick={() => onChange?.('monthly')}
          className={`
            px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300
            ${value === 'monthly'
              ? 'bg-white text-conexia-green shadow-md'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Mensual
        </button>
        
        <button
          onClick={() => onChange?.('annual')}
          className={`
            px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 relative
            ${value === 'annual'
              ? 'bg-white text-conexia-green shadow-md'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Anual
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
            -17%
          </span>
        </button>
      </div>
      
      {value === 'annual' && (
        <p className="text-sm text-gray-600 animate-fade-in">
          🎉 ¡Ahorra hasta un 17% con el plan anual!
        </p>
      )}
    </div>
  );
}
