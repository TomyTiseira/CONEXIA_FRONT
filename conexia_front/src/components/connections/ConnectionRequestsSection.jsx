'use client';
import React from 'react';
import ConnectionRequestCard from '@/components/connections/ConnectionRequestCard';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';

export default function ConnectionRequestsSection() {
  const { requests, loading, error } = useConnectionRequests();
  const [localRequests, setLocalRequests] = React.useState([]);

  React.useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleAccepted = (id) => {
    setLocalRequests((prev) => prev.filter((req) => req.id !== id));
  };
  const handleIgnore = (id) => {
    // TODO: llamada a API para ignorar
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
              onIgnore={() => handleIgnore(req.id)}
              onAccepted={handleAccepted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
