'use client';

import React from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { formatCardNumber, formatCardBrand } from '@/utils/planFormatters';

/**
 * Obtiene el componente de icono de tarjeta según la marca
 * @param {string} brand - Marca de la tarjeta
 * @returns {JSX.Element} - Componente de icono
 */
const CardIcon = ({ brand }) => {
  const brandLower = brand?.toLowerCase();
  
  // Estilos base del icono
  const iconClasses = "w-8 h-8";
  
  // Colores según marca
  const brandColors = {
    'visa': 'text-blue-600',
    'mastercard': 'text-red-500',
    'amex': 'text-blue-500',
    'maestro': 'text-red-600',
    'discover': 'text-orange-500',
    'diners': 'text-blue-700',
  };
  
  const colorClass = brandColors[brandLower] || 'text-gray-600';
  
  return (
    <div className={`${colorClass} ${iconClasses}`}>
      <FiCreditCard className="w-full h-full" />
    </div>
  );
};

/**
 * Componente para mostrar información del método de pago
 * Incluye icono de tarjeta, últimos 4 dígitos y marca
 * 
 * @param {Object} props
 * @param {Object} props.paymentMethod - Información del método de pago
 * @param {string} props.paymentMethod.type - Tipo de método de pago
 * @param {string} props.paymentMethod.lastFourDigits - Últimos 4 dígitos
 * @param {string} props.paymentMethod.brand - Marca de la tarjeta
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.compact - Modo compacto (default: false)
 */
export default function PaymentMethodCard({ 
  paymentMethod, 
  className = '',
  compact = false
}) {
  if (!paymentMethod) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <FiCreditCard className="w-6 h-6" />
          <div>
            <p className="font-medium">No hay método de pago registrado</p>
            <p className="text-sm">Agrega un método de pago para continuar</p>
          </div>
        </div>
      </div>
    );
  }

  const { lastFourDigits, brand } = paymentMethod;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CardIcon brand={brand} />
        <span className="font-mono text-sm">
          {formatCardNumber(lastFourDigits)}
        </span>
        {brand && (
          <span className="text-xs font-semibold text-gray-600 uppercase">
            {formatCardBrand(brand)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardIcon brand={brand} />
          <div>
            <p className="font-mono text-lg font-medium text-gray-800">
              {formatCardNumber(lastFourDigits)}
            </p>
            {brand && (
              <p className="text-sm font-semibold text-gray-600 uppercase mt-1">
                {formatCardBrand(brand)}
              </p>
            )}
          </div>
        </div>
        
        {/* Badge de tipo de tarjeta */}
        <div className="bg-white px-3 py-1 rounded-full border border-gray-300">
          <span className="text-xs font-medium text-gray-600">
            {paymentMethod.type === 'credit_card' ? 'Crédito' : 'Débito'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Variante del componente para mostrar en una lista
 */
export function PaymentMethodListItem({ paymentMethod, className = '' }) {
  if (!paymentMethod) return null;

  const { lastFourDigits, brand } = paymentMethod;

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <div className="flex items-center gap-3">
        <CardIcon brand={brand} />
        <div>
          <p className="font-mono text-sm font-medium">
            {formatCardNumber(lastFourDigits)}
          </p>
          {brand && (
            <p className="text-xs text-gray-500 uppercase">
              {formatCardBrand(brand)}
            </p>
          )}
        </div>
      </div>
      
      <span className="text-xs font-medium text-gray-600">
        {paymentMethod.type === 'credit_card' ? 'Crédito' : 'Débito'}
      </span>
    </div>
  );
}
