'use client';
import React, { useState, useEffect } from 'react';
import ConnectionRequestCard from '@/components/connections/ConnectionRequestCard';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ConnectionRequestsSection() {
  const { requests, loading, error, refreshRequests } = useConnectionRequests();
  const [localRequests, setLocalRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();
  const [toast, setToast] = useState(null);

  React.useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleAccepted = (id) => {
    setLocalRequests((prev) => prev.filter((req) => req.id !== id));
    // Mostrar toast inmediato solo si no hay flag global (evita duplicados)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('connectionAcceptedToast');
      if (!stored) {
        setToast({ type: 'success', message: 'Conexión aceptada.', isVisible: true });
      }
    } else {
      setToast({ type: 'success', message: 'Conexión aceptada.', isVisible: true });
    }
  };
  
  const handleOpenRejectModal = (id) => {
    setSelectedRequestId(id);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    
    try {
      await rejectRequest(selectedRequestId);
      setLocalRequests((prev) => prev.filter((req) => req.id !== selectedRequestId));
      setShowRejectModal(false);
      setSelectedRequestId(null);
      // Actualizar el contexto para reflejar el cambio en toda la aplicación
      refreshRequests();
  setToast({ type: 'rejected', message: 'Solicitud rechazada.', isVisible: true });
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setToast({ type: 'error', message: 'Error al rechazar la solicitud.', isVisible: true });
    }
  };

  // Efecto para consumir flag global (si llegó desde perfil)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('connectionAcceptedToast');
      if (stored) {
        const data = JSON.parse(stored);
        setToast(data);
        sessionStorage.removeItem('connectionAcceptedToast');
      }
    } catch {}
  }, []);

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Solicitudes de conexión</div>
      <div className="text-conexia-green/80 mb-6">Gestiona las invitaciones que recibiste de otros usuarios.</div>
      {loading ? (
        <LoadingSpinner message="Cargando solicitudes..." fullScreen={false} />
      ) : error ? (
        <div className="text-conexia-green/70 text-center py-8">{error}</div>
      ) : localRequests.length === 0 ? (
        <div className="text-conexia-green/70 text-center py-8">No tienes solicitudes pendientes.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {localRequests.map((req) => (
            <ConnectionRequestCard
              key={req.id}
              name={req.sender?.name || 'Sin nombre'}
              profession={req.sender?.profession || 'Sin profesión'}
              image={req.sender?.image}
              requestId={req.id}
              senderId={req.senderId}
              onIgnore={() => handleOpenRejectModal(req.id)}
              onAccepted={handleAccepted}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar solicitud"
        message="¿Estás seguro que deseas rechazar esta solicitud de conexión?"
        confirmButtonText="Rechazar"
        cancelButtonText="Cancelar"
        isLoading={rejectLoading}
      />
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          duration={4000}
        />
      )}
    </div>
  );
}
