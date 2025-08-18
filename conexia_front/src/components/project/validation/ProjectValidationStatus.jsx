'use client';

import { AlertCircle, Clock, CheckCircle, User, X } from 'lucide-react';
import { isProjectFinished } from '@/utils/postulationValidation';

export default function ProjectValidationStatus({ 
  project, 
  user, 
  isOwner, 
  userRole 
}) {
  const getValidationMessages = () => {
    const messages = [];

    // Verificar si el usuario puede ver este componente
    if (isOwner || userRole !== 'USER') {
      return messages;
    }

    // Verificar estado del proyecto
    if (!project?.isActive || project?.status !== 'active') {
      messages.push({
        type: 'error',
        icon: X,
        text: 'Este proyecto no está activo'
      });
    }

    // Verificar si el proyecto ha finalizado
    if (isProjectFinished(project)) {
      messages.push({
        type: 'error',
        icon: Clock,
        text: 'Este proyecto ya ha finalizado'
      });
    } else if (project?.endDate) {
      // Si no ha finalizado pero tiene fecha de fin, mostrar días restantes si es pronto
      const endDate = new Date(project.endDate);
      const now = new Date();
      const timeDiff = endDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 7 && daysDiff > 0) {
        messages.push({
          type: 'warning',
          icon: Clock,
          text: `Este proyecto finaliza en ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`
        });
      }
    }

    // Mensajes informativos si todo está bien
    if (messages.length === 0) {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        text: 'Puedes postularte a este proyecto'
      });
    }

    return messages;
  };

  const messages = getValidationMessages();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      {messages.map((message, index) => {
        const Icon = message.icon;
        const colors = {
          error: 'bg-red-50 text-red-800 border-red-200',
          warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          success: 'bg-green-50 text-green-800 border-green-200'
        };

        return (
          <div
            key={index}
            className={`flex items-center space-x-2 p-3 rounded-lg border ${colors[message.type]}`}
          >
            <Icon size={16} />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        );
      })}
    </div>
  );
}
