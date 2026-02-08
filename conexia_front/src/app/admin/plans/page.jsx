'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import { usePlans } from '@/hooks/memberships/usePlans';
import { useCreatePlan } from '@/hooks/memberships/useCreatePlan';
import { useUpdatePlan } from '@/hooks/memberships/useUpdatePlan';
import { useDeletePlan } from '@/hooks/memberships/useDeletePlan';
import { useTogglePlanStatus } from '@/hooks/memberships/useTogglePlanStatus';
import PlanCard from '@/components/admin/plans/PlanCard';
import CreatePlanModal from '@/components/admin/plans/CreatePlanModal';
import EditPlanModal from '@/components/admin/plans/EditPlanModal';
import DeletePlanModal from '@/components/admin/plans/DeletePlanModal';
import DeactivatePlanModal from '@/components/admin/plans/DeactivatePlanModal';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function PlansManagementPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { plans, loading, refetch } = usePlans(includeInactive);
  const { create, loading: creating } = useCreatePlan();
  const { update, loading: updating } = useUpdatePlan();
  const { remove, loading: deleting } = useDeletePlan();
  const { toggle } = useTogglePlanStatus();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null);

  const handleCreatePlan = async (planData) => {
    try {
      await create(planData);
      setToast({ type: 'success', message: 'Plan creado exitosamente' });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      // Procesar el error con handlePlanError
      let errorInfo;
      try {
        errorInfo = require('@/utils/planErrorHandler').handlePlanError(error);
      } catch {
        errorInfo = { type: 'error', message: error.message || 'Error al crear el plan' };
      }
      setToast({
        type: errorInfo.type || 'error',
        message: errorInfo.message || 'Error al crear el plan',
        position: 'top-center',
      });
    }
  };

  const handleEditPlan = async (planId, planData) => {
    try {
      await update(planId, planData);
      setToast({ type: 'success', message: 'Plan actualizado exitosamente' });
      setShowEditModal(false);
      setSelectedPlan(null);
      refetch();
    } catch (error) {
      const rawMsg = (error && (error.message || error.msg)) || '';
      const status = error && (error.status || error.code || error.response?.status);
      const isDuplicate =
        String(rawMsg).toLowerCase().includes('already exists') ||
        String(rawMsg).toLowerCase().includes('ya existe') ||
        String(rawMsg).toLowerCase().includes('duplicate') ||
        String(status) === '409' || String(status) === '400';
      setToast({
        type: isDuplicate ? 'warning' : 'error',
        message: isDuplicate ? 'Ya existe un plan con este nombre.' : (rawMsg || 'Error al actualizar el plan'),
        position: 'top-center',
      });
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await remove(planId);
      setToast({ type: 'success', message: 'Plan eliminado exitosamente' });
      setShowDeleteModal(false);
      setSelectedPlan(null);
      refetch();
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: error.message || 'Error al eliminar el plan' 
      });
    }
  };

  const handleToggleStatus = (plan) => {
    setSelectedPlan(plan);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedPlan) return;
    const newStatus = !selectedPlan.active;
    try {
      await toggle(selectedPlan.id, newStatus);
      setToast({
        type: 'success',
        message: `Plan ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      });
      setShowDeactivateModal(false);
      setSelectedPlan(null);
      refetch();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || `Error al ${newStatus ? 'activar' : 'desactivar'} el plan`,
      });
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  return (
    <>
      <NavbarAdmin />
      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header card */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative">
          <h1 className="text-2xl font-bold text-conexia-green text-center">
            Planes de membresía
          </h1>

          <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
            <Button
              variant="add"
              className="flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              Agregar plan
            </Button>
          </div>

          <div className="sm:hidden mt-4 flex justify-center">
            <Button
              variant="add"
              className="flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              Agregar plan
            </Button>
          </div>
        </div>

        {/* Filtro */}
        <div className="flex items-center justify-end gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border">
          <input
            type="checkbox"
            id="includeInactive"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 border-gray-300 rounded cursor-pointer accent-conexia-green focus:ring-conexia-green"
          />
          <label htmlFor="includeInactive" className="text-sm text-gray-700 cursor-pointer select-none">
            Mostrar planes desactivados
          </label>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto mb-4"></div>
              <p className="text-conexia-green">Cargando planes...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <p className="text-gray-600">No hay planes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePlan}
          loading={creating}
        />
      )}

      {showEditModal && selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlan(null);
          }}
          onSave={handleEditPlan}
          loading={updating}
        />
      )}

      {showDeleteModal && selectedPlan && (
        <DeletePlanModal
          plan={selectedPlan}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={handleDeletePlan}
          loading={deleting}
        />
      )}

      {showDeactivateModal && selectedPlan && (
        <DeactivatePlanModal
          plan={selectedPlan}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={confirmDeactivate}
          loading={updating}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible
          onClose={() => setToast(null)}
          position="top-center"
        />
      )}
    </>
  );
}
