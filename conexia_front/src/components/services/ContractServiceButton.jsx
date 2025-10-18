'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import ContractServiceModal from './ContractServiceModal';
import { isExpired } from '@/utils/quotationVigency';

export default function ContractServiceButton({ 
  serviceHiring, 
  onContractSuccess,
  highlight = false,
  size = 'md' // 'md' (w-9 h-9) o 'sm' (w-8 h-8) para mobile
}) {
  const [showModal, setShowModal] = useState(false);

  // Solo mostrar el botón si el service hiring está en estado 'accepted'
  if (!serviceHiring || serviceHiring.status?.code !== 'accepted') {
    return null;
  }

  // No mostrar el botón si la cotización está vencida
  if (isExpired(serviceHiring)) {
    return null;
  }

  const handleSuccess = (result) => {
    if (onContractSuccess) {
      onContractSuccess(result);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'}
          ${highlight 
            ? 'bg-[#367d7d] text-white hover:bg-[#2b6a6a] shadow-sm ring-1 ring-conexia-green/70' 
            : 'text-conexia-green hover:text-conexia-green/90 hover:bg-conexia-green/10'}
        `}
        title="Pagar / Contratar servicio"
        aria-label="Pagar / Contratar servicio"
        data-action="contratar-servicio"
      >
        <CreditCard size={size === 'sm' ? 16 : 18} />
      </button>

      <ContractServiceModal
        serviceHiring={serviceHiring}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}