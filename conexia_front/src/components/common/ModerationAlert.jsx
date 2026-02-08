import { AlertCircle } from 'lucide-react';

/**
 * Componente de alerta para contenido moderado
 * @param {Object} props
 * @param {'service'|'project'} props.type - Tipo de contenido (servicio o proyecto)
 * @param {string} [props.className] - Clases CSS adicionales
 */
export default function ModerationAlert({ type = 'service', className = '' }) {
  const config = {
    service: {
      title: 'Servicio Finalizado por Moderación',
      message: 'Este servicio ha sido finalizado por el equipo de moderación de Conexia. No se pueden realizar nuevas contrataciones.',
    },
    project: {
      title: 'Proyecto Suspendido por Moderación',
      message: 'Este proyecto ha sido suspendido por el equipo de moderación de Conexia. No se aceptan nuevas postulaciones.',
    }
  };

  const { title, message } = config[type] || config.service;

  return (
    <div 
      className={`bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            {title}
          </h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
