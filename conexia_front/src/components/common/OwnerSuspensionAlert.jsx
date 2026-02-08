import { AlertCircle, Calendar } from 'lucide-react';

/**
 * Componente de alerta para cuando el owner de un servicio/proyecto está suspendido
 * @param {Object} props
 * @param {Object} props.data - Objeto del servicio o proyecto con campos ownerAccountStatus, ownerSuspensionExpiresAt, etc.
 * @param {string} [props.contentType] - Tipo de contenido: 'servicio' o 'proyecto'
 * @param {boolean} [props.isOwner] - Si el usuario actual es el dueño del contenido
 * @param {string} [props.className] - Clases CSS adicionales
 */
export default function OwnerSuspensionAlert({ 
  data, 
  contentType = 'contenido',
  isOwner = false,
  className = '' 
}) {
  // Usar ownerAccountStatus como fuente de verdad
  const isOwnerSuspended = data?.ownerAccountStatus === 'suspended';
  const isOwnerBanned = data?.ownerAccountStatus === 'banned';

  // Si el owner no está ni suspendido ni baneado, no mostrar nada
  if (!isOwnerSuspended && !isOwnerBanned) {
    return null;
  }

  // Formatear fecha de expiración si existe
  let expirationDate = null;
  let daysRemaining = null;
  
  if (isOwnerSuspended && data?.ownerSuspensionExpiresAt) {
    try {
      const date = new Date(data.ownerSuspensionExpiresAt);
      if (!isNaN(date.getTime())) {
        expirationDate = date.toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        // Calcular días restantes
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    } catch (error) {
      console.error('Error parsing ownerSuspensionExpiresAt:', error);
    }
  }

  // Amarillo para suspendido (temporal), Rojo para baneado (permanente)
  const isPermanent = isOwnerBanned;
  const bgColor = isPermanent ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = isPermanent ? 'border-red-400' : 'border-amber-400';
  const iconColor = isPermanent ? 'text-red-600' : 'text-amber-600';
  const titleColor = isPermanent ? 'text-red-900' : 'text-amber-900';
  const messageColor = isPermanent ? 'text-red-800' : 'text-amber-800';

  // Generar el título
  const title = isPermanent 
    ? `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} no disponible`
    : `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} temporalmente no disponible`;

  // Generar el mensaje (cambia según si es el owner o no)
  let message;
  if (isOwner) {
    // Mensaje en segunda persona para el dueño
    message = isPermanent
      ? `Este ${contentType} ha sido desactivado permanentemente porque tu cuenta fue suspendida de forma definitiva. No podrá ser reactivado.`
      : `Este ${contentType} no está disponible temporalmente porque tienes tu cuenta suspendida.`;
  } else {
    // Mensaje en tercera persona para visitantes
    message = isPermanent
      ? `Este ${contentType} no estará disponible permanentemente porque la cuenta del propietario fue suspendida de forma definitiva por violación de las políticas de Conexia.`
      : `Este ${contentType} no está disponible temporalmente porque el propietario tiene su cuenta suspendida.`;
  }
  
  return (
    <div 
      className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-lg mb-4 shadow-sm ${className}`}
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
          
          {/* Mostrar fecha de expiración y días restantes si está suspendido temporalmente */}
          {!isPermanent && expirationDate && (
            <div className="mt-3 flex items-center gap-2 bg-white/50 rounded px-3 py-2 border border-amber-200">
              <Calendar className={`w-4 h-4 ${iconColor}`} />
              <div className="flex-1">
                <span className={`text-sm font-semibold ${titleColor}`}>
                  Disponible a partir del: {expirationDate}
                </span>
                {daysRemaining !== null && (
                  <span className={`text-xs ${messageColor} ml-2`}>
                    ({daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
