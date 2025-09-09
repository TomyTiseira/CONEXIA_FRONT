'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSentConnectionRequests } from '@/service/connections/getSentConnectionRequests';
import { useCancelConnectionRequest } from '@/hooks/connections/useCancelConnectionRequest';
import SentConnectionRequestCard from '@/components/connections/SentConnectionRequestCard';
import { ConfirmModal } from '@/components/ui';

export default function SentRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const { cancelRequest, loading: cancelLoading } = useCancelConnectionRequest();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const fetchSentRequests = async () => {
      setLoading(true);
      try {
        const result = await getSentConnectionRequests();
        if (isMounted) {
          setRequests(result?.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al obtener solicitudes enviadas');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSentRequests();
    return () => { isMounted = false; };
  }, []);

  const handleOpenCancelModal = (requestId) => {
    setSelectedRequestId(requestId);
    setShowModal(true);
  };

  const handleCancel = async () => {
    if (!selectedRequestId) return;
    
    try {
      await cancelRequest(selectedRequestId);
      setRequests(prev => prev.filter(req => req.id !== selectedRequestId));
      setShowModal(false);
      setSelectedRequestId(null);
    } catch (err) {
      console.error('Error al cancelar solicitud:', err);
      // Opcional: Mostrar mensaje de error
    }
  };

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Solicitudes enviadas</div>
      <div className="text-conexia-green/80 mb-6">Solicitudes de conexión que enviaste a otros usuarios.</div>
      
      {loading ? (
        <div className="text-conexia-green/70 text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-conexia-green/70 text-center py-8">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-conexia-green/70 text-center py-8">No has enviado solicitudes recientemente.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <SentConnectionRequestCard
              key={req.id}
              name={req.receiver?.name || 'Sin nombre'}
              profession={req.receiver?.profession || 'Sin profesión'}
              image={req.receiver?.image}
              requestId={req.id}
              receiverId={req.receiverId}
              onCancel={() => handleOpenCancelModal(req.id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleCancel}
        title="Cancelar solicitud"
        message="¿Estás seguro que deseas cancelar esta solicitud de conexión?"
        confirmButtonText="Confirmar"
        cancelButtonText="Cancelar"
        isLoading={cancelLoading}
      />
    </div>
  );
}
