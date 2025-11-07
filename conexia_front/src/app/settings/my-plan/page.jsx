'use client';

import React, { useState } from 'react';
import { usePlans } from '@/hooks/plans/usePlans';
import { useUserPlan } from '@/hooks/memberships';
import { useSubscriptionContract } from '@/hooks/plans/useSubscriptionContract';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import PlanCard from '@/components/plans/PlanCard';
import PlanDetailsModal from '@/components/plans/PlanDetailsModal';
import PricingToggle from '@/components/plans/PricingToggle';
import ContractConfirmationModal from '@/components/plans/ContractConfirmationModal';
import { PlanInfoCard } from '@/components/plans';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/constants/roles';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';

export default function MyPlanPage() {
  useSessionTimeout();
  const { plans, loading, error, refetch } = usePlans();
  const { data: currentUserPlanData } = useUserPlan();
  const { handleContractPlan, loading: contracting, error: contractError } = useSubscriptionContract();
  const { user } = useAuth();
  const { roleName, profile } = useUserStore();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [planToContract, setPlanToContract] = useState(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Determinar si el usuario puede contratar planes
  const canContractPlans = roleName === ROLES.USER;

  // Obtener el plan actual del usuario desde el nuevo hook
  const currentPlanId = currentUserPlanData?.plan?.id || profile?.planId || 1;

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
      setShowErrorAlert(false); // Limpiar errores previos
    }
  };

  const handleConfirmContract = async (planId, billingCycle, cardTokenId) => {
    try {
      setShowErrorAlert(false);
      await handleContractPlan(planId, billingCycle, cardTokenId);
      // La redirección a MercadoPago se maneja en el hook
    } catch (err) {
      console.error('Error al contratar plan:', err);
      setShowErrorAlert(true);
      // No cerrar el modal para que el usuario vea el error
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
          Mi Plan
        </h1>
        <p className="text-gray-600">
          Gestiona tu suscripción y explora planes para desbloquear más beneficios
        </p>
      </div>

      {/* Plan Info Card - Mostrar info del plan actual del usuario */}
      {canContractPlans && (
        <div className="mb-8">
          <PlanInfoCard />
        </div>
      )}

      {/* Divider */}
      <div className="mb-8 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Explorar Planes
        </h2>
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

        {/* Alerta de error al contratar */}
        {showErrorAlert && contractError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    {contractError.title || 'Error al contratar plan'}
                  </h3>
                  <p className="text-sm text-red-700">
                    {contractError.message || 'Ocurrió un error al procesar tu solicitud'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowErrorAlert(false)}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Cerrar alerta"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Toggle */}
      <div className="mb-8 flex justify-center">
        <PricingToggle 
          value={billingCycle}
          onChange={setBillingCycle}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
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
