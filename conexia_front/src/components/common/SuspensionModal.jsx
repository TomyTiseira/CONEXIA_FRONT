'use client';

import { X, AlertCircle, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import Button from '@/components/ui/Button';

/**
 * Modal informativo sobre la suspensión de cuenta
 * Sigue el estilo de los modales de Conexia
 */
export default function SuspensionModal({ isOpen, onClose }) {
  const { isSuspended, isBanned, suspensionExpiresAt } = useAccountStatus();

  if (!isOpen || (!isSuspended && !isBanned)) return null;

  // Formatear fecha de expiración
  let expirationDate = null;
  let daysRemaining = null;
  
  if (suspensionExpiresAt) {
    try {
      const date = new Date(suspensionExpiresAt);
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
      console.error('Error parsing suspensionExpiresAt:', error);
    }
  }

  const config = isBanned ? {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    title: 'Cuenta suspendida permanentemente',
    message: 'Tu cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia.'
  } : {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-800',
    title: 'Cuenta Suspendida Temporalmente',
    message: expirationDate 
      ? `Tu cuenta ha sido suspendida hasta el ${expirationDate}.`
      : 'Tu cuenta ha sido suspendida temporalmente.'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente de color */}
        <div className={`p-8 ${
          isBanned 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-amber-400 to-amber-500'
        }`}>
          <h3 className="text-white text-2xl font-bold text-center">
            {config.title}
          </h3>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Alert banner principal */}
          <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg mb-6 shadow-sm`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className={`${config.textColor} text-sm leading-relaxed`}>
                  {config.message}
                </p>
                {!isBanned && daysRemaining !== null && (
                  <div className="mt-3 flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${config.iconColor}`} />
                    <span className={`text-sm font-semibold ${config.titleColor}`}>
                      {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Durante la suspensión */}
          <div className="space-y-4">
            <h4 className="text-conexia-green font-bold text-base">
              Durante la suspensión
            </h4>

            {/* Lo que SÍ puede hacer */}
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-green-900 mb-2 text-sm">Puedes hacer:</h5>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Completar tus proyectos y servicios actuales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Comunicarte con tus clientes y colaboradores actuales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Ver tu perfil y contenido existente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Acceder a tus mensajes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lo que NO puede hacer */}
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-red-900 mb-2 text-sm">No puedes hacer:</h5>
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Crear nuevos proyectos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Publicar nuevos servicios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Postularte a proyectos de otros usuarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Recibir nuevas postulaciones en tus proyectos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Solicitar cotizaciones en servicios de otros usuarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Recibir solicitudes de cotización en tus servicios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Crear nuevas publicaciones en la comunidad</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mensaje de reactivación */}
            {!isBanned && (
              <div className="bg-conexia-soft border border-conexia-green/20 rounded-lg p-4">
                <p className="text-sm text-conexia-green text-center">
                  <span className="font-semibold">Tu cuenta se reactivará automáticamente</span> cuando finalice el período de suspensión. Podrás volver a usar todas las funcionalidades de Conexia.
                </p>
              </div>
            )}

            {/* Información de contacto */}
            {!isBanned && (
              <div className="text-center pt-2">
                <p className="text-sm text-conexia-green">
                  ¿Tenés dudas o deseás apelar esta decisión? Podés contactar a nuestro equipo de soporte en{' '}
                  <a 
                    href="mailto:soporte@conexia.com" 
                    className="text-conexia-green hover:underline font-semibold"
                  >
                    soporte@conexia.com
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button
            variant="primary"
            onClick={onClose}
            className="px-6 py-2"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
