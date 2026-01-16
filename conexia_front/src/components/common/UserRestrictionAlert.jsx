import { AlertCircle } from 'lucide-react';

/**
 * Componente de alerta para usuarios baneados o suspendidos
 * @param {Object} props
 * @param {boolean} props.isBanned - Usuario baneado permanentemente
 * @param {boolean} props.isSuspended - Usuario suspendido temporalmente
 * @param {string} [props.suspensionExpiresAt] - Fecha de expiración de la suspensión (ISO 8601)
 * @param {boolean} [props.isOwner] - Si el usuario viendo el perfil es el dueño
 * @param {string} [props.className] - Clases CSS adicionales
 */
export default function UserRestrictionAlert({ 
  isBanned = false, 
  isSuspended = false, 
  suspensionExpiresAt = null, 
  isOwner = false,
  className = '' 
}) {
  // Si no está ni baneado ni suspendido, no mostrar nada
  if (!isBanned && !isSuspended) {
    return null;
  }

  // Determinar el tipo de restricción y los estilos
  const isPermanent = isBanned;
  const bgColor = isPermanent ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = isPermanent ? 'border-red-400' : 'border-amber-400';
  const iconColor = isPermanent ? 'text-red-600' : 'text-amber-600';
  const titleColor = isPermanent ? 'text-red-900' : 'text-amber-900';
  const messageColor = isPermanent ? 'text-red-800' : 'text-amber-800';

  // Generar el título
  const title = isPermanent 
    ? 'Cuenta suspendida permanentemente ' 
    : 'Cuenta suspendida temporalmente';

  // Generar el mensaje según si es el dueño o un visitante
  let message;
  if (isPermanent) {
    if (isOwner) {
      message = 'Tu cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia.';
    } else {
      message = 'Esta cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia.';
    }
  } else if (isSuspended) {
    if (isOwner && suspensionExpiresAt) {
      // Mensaje para el dueño: incluir fecha de expiración
      try {
        const expirationDate = new Date(suspensionExpiresAt);
        if (!isNaN(expirationDate.getTime())) {
          const formattedDate = expirationDate.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          message = `Tu cuenta se encuentra suspendida temporalmente hasta el ${formattedDate} por violación de las políticas de Conexia.`;
        } else {
          message = 'Tu cuenta se encuentra suspendida temporalmente por violación de las políticas de Conexia.';
        }
      } catch (error) {
        console.error('Error parsing suspensionExpiresAt:', error);
        message = 'Tu cuenta se encuentra suspendida temporalmente por violación de las políticas de Conexia.';
      }
    } else {
      // Mensaje para visitantes: sin fecha de expiración
      message = 'Esta cuenta se encuentra suspendida temporalmente por violación de las políticas de Conexia.';
    }
  } else {
    message = isOwner 
      ? 'Tu cuenta se encuentra suspendida temporalmente por violación de las políticas de Conexia.'
      : 'Esta cuenta se encuentra suspendida temporalmente por violación de las políticas de Conexia.';
  }

  return (
    <div 
      className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-lg mb-6 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${titleColor} mb-1`}>
            {title}
          </h3>
          <p className={`${messageColor} text-sm leading-relaxed`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
