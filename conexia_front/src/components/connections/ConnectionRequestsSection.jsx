'use client';
import React, { useState } from 'react';
import ConnectionRequestCard from '@/components/connections/ConnectionRequestCard';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import { ConfirmModal } from '@/components/ui';

export default function ConnectionRequestsSection() {
  const { requests, loading, error } = useConnectionRequests();
  const [localRequests, setLocalRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();

  React.useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleAccepted = (id) => {
    setLocalRequests((prev) => prev.filter((req) => req.id !== id));
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
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      // Opcional: Mostrar mensaje de error
    }
  };

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Solicitudes de conexión</div>
      <div className="text-conexia-green/80 mb-6">Gestiona las invitaciones que recibiste de otros usuarios.</div>
      {loading ? (
        <div className="text-conexia-green/70 text-center py-8">Cargando...</div>
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
    </div>
  );
}
