'use client';

import React, { useState } from 'react';
import { usePlans } from '@/hooks/plans/usePlans';
import { useSubscriptionContract } from '@/hooks/plans/useSubscriptionContract';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import PlanCard from '@/components/plans/PlanCard';
import PlanDetailsModal from '@/components/plans/PlanDetailsModal';
import PricingToggle from '@/components/plans/PricingToggle';
import ContractConfirmationModal from '@/components/plans/ContractConfirmationModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/constants/roles';
import { FiAlertCircle } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';

export default function MyPlanPage() {
  useSessionTimeout();
  const { plans, loading, error, refetch } = usePlans();
  const { handleContractPlan, loading: contracting, error: contractError } = useSubscriptionContract();
  const { user } = useAuth();
  const { roleName, profile } = useUserStore();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [planToContract, setPlanToContract] = useState(null);

  // Determinar si el usuario puede contratar planes
  const canContractPlans = roleName === ROLES.USER;

  // Obtener el plan actual del usuario (por ahora desde profile o asumir Free)
  const currentPlanId = profile?.planId || 1; // Asumir 1 como plan Free por defecto

  // Handlers
  const handleInitiateContract = (planId) => {
    if (!canContractPlans) {
      alert('No tienes permisos para contratar planes');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setPlanToContract(plan);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmContract = async (planId, billingCycle, cardTokenId) => {
    try {
      await handleContractPlan(planId, billingCycle, cardTokenId);
      // La redirección a MercadoPago se maneja en el hook
    } catch (err) {
      console.error('Error al contratar plan:', err);
      alert(err.message || 'Error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  const handleCloseConfirmModal = () => {
    if (!contracting) {
      setIsConfirmModalOpen(false);
      setPlanToContract(null);
    }
  };

  const handleViewDetails = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPlan(null);
  };

  // Estado de carga
  if (loading) {
    return <LoadingSpinner message="Cargando planes..." fullScreen={false} />;
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-4">
        <FiAlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Error al cargar los planes</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-conexia-green text-white rounded-lg hover:bg-[#1a7a66] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Determinar cuál es el plan más popular (generalmente el del medio)
  const mostPopularPlanName = 'Basic'; // o 'Plus' según tu configuración

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mejora tu plan
        </h1>
        <p className="text-gray-600">
          Elige el plan perfecto para ti y desbloquea todo el potencial de Conexia
        </p>
        
        {/* Mensaje especial para admin/moderador */}
        {!canContractPlans && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <FiAlertCircle className="w-4 h-4" />
            Como {roleName}, puedes visualizar los planes pero no contratarlos
          </div>
        )}
      </div>

      {/* Pricing Toggle */}
      <div className="mb-12">
        <PricingToggle 
          value={billingCycle}
          onChange={setBillingCycle}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            isMostPopular={plan.name === mostPopularPlanName}
            billingCycle={billingCycle}
            canContract={canContractPlans}
            onContractClick={handleInitiateContract}
            onDetailsClick={handleViewDetails}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-4 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          ¿Tienes preguntas sobre nuestros planes?
        </h3>
        <p className="text-gray-600 text-sm">
          Contáctanos y te ayudaremos a elegir el mejor plan para tus necesidades
        </p>
      </div>

      {/* Modal de detalles */}
      <PlanDetailsModal
        plan={selectedPlan}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        isCurrentPlan={selectedPlan?.id === currentPlanId}
        billingCycle={billingCycle}
        canContract={canContractPlans}
        onContractClick={handleInitiateContract}
      />

      {/* Modal de confirmación de pago */}
      <ContractConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        plan={planToContract}
        billingCycle={billingCycle}
        onConfirm={handleConfirmContract}
        loading={contracting}
      />
    </div>
  );
}
