'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import ContractServiceModal from './ContractServiceModal';

export default function ContractServiceButton({ 
  serviceHiring, 
  onContractSuccess,
  className = ""
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
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <CreditCard size={16} />
        Contratar Servicio
      </Button>

      <ContractServiceModal
        serviceHiring={serviceHiring}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}