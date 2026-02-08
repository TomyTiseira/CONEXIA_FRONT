/**
 * Badge para mostrar el estado de postulaciones a proyectos
 * @param {Object} props
 * @param {string} props.status - Estado de la postulación
 * @param {string} props.className - Clases adicionales
 */
export default function PostulationStatusBadge({ status, className = '' }) {
  const config = {
    pending: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    accepted: {
      label: 'Aceptada',
      className: 'bg-green-100 text-green-800 border-green-300'
    },
    rejected: {
      label: 'Rechazada',
      className: 'bg-red-100 text-red-800 border-red-300'
    },
    cancelled: {
      label: 'Cancelada',
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    },
    // Estados de moderación para postulaciones
    cancelled_by_moderation: {
      label: 'Cancelada por Moderación',
      className: 'bg-red-100 text-red-700 border border-red-300'
    },
    cancelled_by_suspension: {
      label: 'Cancelada por Suspensión',
      className: 'bg-amber-100 text-amber-700 border border-amber-300'
    }
  };

  const statusData = config[status] || { 
    label: status || 'Desconocido', 
    className: 'bg-gray-100 text-gray-800 border-gray-300' 
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${statusData.className} ${className}`}
    >
      {statusData.label}
    </span>
  );
}
