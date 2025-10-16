'use client';

import { CreditCard, Package } from 'lucide-react';

/**
 * Componente para seleccionar la modalidad de pago
 * @param {Object} props
 * @param {Array} props.modalities - Lista de modalidades disponibles
 * @param {number} props.selectedId - ID de la modalidad seleccionada
 * @param {Function} props.onChange - Callback al cambiar la modalidad
 * @param {boolean} props.disabled - Si el selector está deshabilitado
 */
export default function PaymentModalitySelector({ modalities, selectedId, onChange, disabled = false }) {
  if (!modalities || modalities.length === 0) {
    return null;
  }

  const getIcon = (code) => {
    const iconClass = "flex-shrink-0";
    switch (code) {
      case 'full_payment':
        return <CreditCard size={20} className={`text-conexia-green ${iconClass}`} />;
      case 'by_deliverables':
        return <Package size={20} className={`text-blue-600 ${iconClass} -mt-0.5`} />;
      default:
        return <CreditCard size={20} className={`text-gray-600 ${iconClass}`} />;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Modalidad de pago *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modalities
          .filter(m => m.isActive)
          .map((modality) => (
            <button
              key={modality.id}
              type="button"
              onClick={() => !disabled && onChange(modality.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${selectedId === modality.id 
                  ? 'border-conexia-green bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Radio button indicator */}
              <div className="absolute top-4 right-4">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedId === modality.id 
                    ? 'border-conexia-green bg-conexia-green' 
                    : 'border-gray-300 bg-white'
                  }
                `}>
                  {selectedId === modality.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className={`pr-8 ${modality.code === 'by_deliverables' ? '-mt-4' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(modality.code)}
                  <h4 className="font-semibold text-gray-900 leading-5">
                    {modality.name}
                  </h4>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {modality.description}
                </p>

                {/* Mostrar porcentajes si es pago total */}
                {modality.code === 'full_payment' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      • Anticipo: {modality.initialPaymentPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                      • Al finalizar: {modality.finalPaymentPercentage}%
                    </p>
                  </div>
                )}

                {/* Indicador para entregables */}
                {modality.code === 'by_deliverables' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      • Pago por cada entregable aprobado
                    </p>
                  </div>
                )}
              </div>
            </button>
          ))}
      </div>

      {/* Leyenda informativa según la modalidad seleccionada */}
      {selectedId && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              {(() => {
                const selectedModality = modalities.find(m => m.id === selectedId);
                if (!selectedModality) return null;

                if (selectedModality.code === 'full_payment') {
                  return (
                    <>
                      <p className="font-medium mb-1">Modalidad de pago total:</p>
                      <p>
                        Al aceptar esta cotización, el cliente pagará el <strong>{selectedModality.initialPaymentPercentage}%</strong> del total como adelanto.
                        Al marcar el servicio como completado, se liberará el <strong>{selectedModality.finalPaymentPercentage}%</strong> restante.
                      </p>
                    </>
                  );
                }

                if (selectedModality.code === 'by_deliverables') {
                  return (
                    <>
                      <p className="font-medium mb-1">Modalidad por entregables:</p>
                      <p>
                        El cliente pagará cada entregable al confirmarlo como recibido.
                        Una vez aprobado un entregable, se iniciará el trabajo del siguiente.
                      </p>
                    </>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
