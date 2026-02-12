/**
 * Badge para mostrar el estado de entregas, entregables y servicios
 * @param {Object} props
 * @param {string} props.status - Estado a mostrar
 * @param {string} props.type - Tipo de badge: 'delivery' | 'deliverable' | 'hiring' (default: 'delivery')
 * @param {string} props.className - Clases adicionales
 */
export default function StatusBadge({ status, type = 'delivery', className = '' }) {
  // Configuración para deliveries
  const deliveryConfig = {
    pending: {
      label: 'Pendiente',
      className: 'bg-gray-200 text-gray-800'
    },
    in_progress: {
      label: 'En progreso',
      className: 'bg-blue-200 text-blue-800'
    },
    delivered: {
      label: 'Entregado',
      className: 'bg-yellow-200 text-yellow-800'
    },
    pending_payment: {
      label: 'Pendiente de Pago',
      className: 'bg-amber-200 text-amber-800'
    },
    approved: {
      label: 'Aprobado',
      className: 'bg-green-200 text-green-800'
    },
    revision_requested: {
      label: 'Revisión solicitada',
      className: 'bg-orange-200 text-orange-800'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-red-200 text-red-800'
    },
    cancelled_by_moderation: {
      label: 'Cancelado por moderación',
      className: 'bg-slate-200 text-slate-800 border border-slate-300'
    }
  };

  // Configuración para deliverables
  const deliverableConfig = {
    pending: {
      label: 'Pendiente',
      className: 'bg-gray-100 text-gray-700'
    },
    in_progress: {
      label: 'En Progreso',
      className: 'bg-blue-100 text-blue-700'
    },
    delivered: {
      label: 'Entregado',
      className: 'bg-yellow-100 text-yellow-700'
    },
    approved: {
      label: 'Aprobado',
      className: 'bg-green-100 text-green-700'
    },
    revision_requested: {
      label: 'Revisión solicitada',
      className: 'bg-orange-100 text-orange-700'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-red-100 text-red-700'
    },
    cancelled_by_moderation: {
      label: 'Cancelado por moderación',
      className: 'bg-slate-100 text-slate-700 border border-slate-300'
    }
  };

  // Configuración para hirings
  const hiringConfig = {
    pending: {
      label: 'Pendiente',
      className: 'bg-gray-200 text-gray-800'
    },
    quoted: {
      label: 'Cotizado',
      className: 'bg-blue-200 text-blue-800'
    },
    requoting: {
      label: 'Re-cotizando',
      className: 'bg-sky-200 text-sky-800'
    },
    accepted: {
      label: 'Aceptado',
      className: 'bg-green-200 text-green-800'
    },
    approved: {
      label: 'Aprobado',
      className: 'bg-conexia-green/10 text-conexia-green'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-red-200 text-red-800'
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-gray-200 text-gray-800'
    },
    negotiating: {
      label: 'Negociando',
      className: 'bg-orange-200 text-orange-800'
    },
    in_progress: {
      label: 'En progreso',
      className: 'bg-purple-200 text-purple-800'
    },
    delivered: {
      label: 'Entregado',
      className: 'bg-teal-200 text-teal-800'
    },
    revision_requested: {
      label: 'Revisión solicitada',
      className: 'bg-orange-200 text-orange-800'
    },
    completed: {
      label: 'Completado',
      className: 'bg-green-200 text-green-800'
    },
    in_claim: {
      label: 'En reclamo',
      className: 'bg-red-100 text-red-700'
    },
    cancelled_by_claim: {
      label: 'Cancelado por reclamo',
      className: 'bg-red-200 text-red-800'
    },
    completed_by_claim: {
      label: 'Finalizado por reclamo',
      className: 'bg-purple-200 text-purple-800'
    },
    completed_with_agreement: {
      label: 'Finalizado con acuerdo',
      className: 'bg-teal-200 text-teal-800'
    },
    // Estados de moderación para servicios
    terminated_by_moderation: {
      label: 'Terminado por moderación',
      className: 'bg-red-100 text-red-700 border border-red-300'
    },
    finished_by_moderation: {
      label: 'Finalizado por moderación',
      className: 'bg-amber-100 text-amber-700 border border-amber-300'
    }
  };

  // Seleccionar configuración según el tipo
  let config;
  switch (type) {
    case 'deliverable':
      config = deliverableConfig;
      break;
    case 'hiring':
      config = hiringConfig;
      break;
    case 'delivery':
    default:
      config = deliveryConfig;
      break;
  }

  const statusData = config[status] || { 
    label: status || 'Desconocido', 
    className: 'bg-gray-200 text-gray-800' 
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusData.className} ${className}`}
    >
      {statusData.label}
    </span>
  );
}
