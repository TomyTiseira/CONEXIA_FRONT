'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import ContractServiceModal from './ContractServiceModal';

export default function ContractServiceButton({ 
  serviceHiring, 
  onContractSuccess
}) {
  const [showModal, setShowModal] = useState(false);

  // Solo mostrar el botón si el service hiring está en estado 'accepted'
  if (!serviceHiring || serviceHiring.status?.code !== 'accepted') {
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
        className="p-2 text-conexia-green hover:text-conexia-green/80 hover:bg-conexia-green/10 rounded"
        title="Contratar Servicio"
      >
        <CreditCard size={16} />
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