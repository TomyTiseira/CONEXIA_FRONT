'use client';
import React, { useState } from 'react';
import ConnectionRequestCard from '@/components/connections/ConnectionRequestCard';

const mockRequests = [
  { id: 1, name: 'Prueba 200', profession: 'Ingeniero en Sistemas de Información' },
  { id: 2, name: 'Alex Paredes', profession: 'Desarrollador Frontend' },
  { id: 3, name: 'María López', profession: 'Diseñadora UX/UI' },
];

export default function ConnectionRequestsSection() {
  const [requests, setRequests] = useState(mockRequests);

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // Aquí iría la lógica real de aceptar
  };
  const handleIgnore = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // Aquí iría la lógica real de ignorar
  };

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Solicitudes de conexión</div>
      <div className="text-conexia-green/80 mb-6">Gestiona las invitaciones que recibiste de otros usuarios.</div>
      {requests.length === 0 ? (
        <div className="text-conexia-green/70 text-center py-8">No tienes solicitudes pendientes.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {requests.map((req) => (
            <ConnectionRequestCard
              key={req.id}
              name={req.name}
              profession={req.profession}
              onAccept={() => handleAccept(req.id)}
              onIgnore={() => handleIgnore(req.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
