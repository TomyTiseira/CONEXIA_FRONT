'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { usePlans } from '@/hooks/plans';
import { useAuth } from '@/context/AuthContext';

/**
 * Modal que se muestra cuando el usuario alcanza su límite de publicaciones
 * según su plan de suscripción
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.type - Tipo de publicación ('project' | 'service')
 * @param {number} props.current - Cantidad actual de publicaciones
 * @param {number} props.limit - Límite permitido
 * @param {string} props.planName - Nombre del plan actual
 * @param {string} props.viewUrl - URL para ver publicaciones actuales (opcional)
 */
export default function LimitReachedModal({
  isOpen,
  onClose,
  type = 'project',
  current = 0,
  limit = 0,
  planName = 'Free',
  viewUrl = null,
}) {
  const router = useRouter();
  const { plans, loading: plansLoading } = usePlans();
  const { user } = useAuth();

  if (!isOpen) return null;

  const typeConfig = {
    project: {
      emoji: '📁',
      title: 'Límite de proyectos alcanzado',
      singular: 'proyecto',
      plural: 'proyectos',
      viewLabel: 'Ver mis proyectos',
      defaultViewUrl: user?.id ? `/projects/user/${user.id}` : '/projects',
      description: 'Para seguir compartiendo tus ideas y colaborar con más profesionales, actualiza tu plan y desbloquea más publicaciones.',
    },
    service: {
      emoji: '🎯',
      title: 'Límite de servicios alcanzado',
      singular: 'servicio',
      plural: 'servicios',
      viewLabel: 'Ver mis servicios',
      defaultViewUrl: user?.id ? `/services/profile/${user.id}` : '/services',
      description: 'Amplía tu alcance y ofrece más servicios actualizando tu plan.',
    },
  };

  const config = typeConfig[type] || typeConfig.project;
  const finalViewUrl = viewUrl || config.defaultViewUrl;

  // Función helper para obtener el valor de un beneficio específico
  const getBenefitValue = (plan, benefitKey) => {
    if (!plan?.benefits || !Array.isArray(plan.benefits)) {
      return 0;
    }
    
    const benefit = plan.benefits.find(b => b.key === benefitKey);
    
    if (!benefit) return 0;
    
    // Parsear el valor en caso de que venga como string
    const value = parseInt(benefit.value, 10);
    return isNaN(value) ? 0 : value;
  };

  // Función helper para formatear el límite (convierte -1 en "Ilimitado")
  const formatLimit = (value) => {
    if (value === -1 || value === '-1') return 'Ilimitado';
    return value;
  };

  // Obtener los límites reales desde los planes
  const benefitKey = type === 'project' ? 'publish_projects' : 'publish_services';
  
  const plansData = plans.map(plan => {
    const limitValue = getBenefitValue(plan, benefitKey);
    return {
      name: plan.name,
      limit: formatLimit(limitValue)
    };
  });

  const handleUpgradePlan = () => {
    router.push('/settings/my-plan');
    onClose();
  };

  const handleViewPublications = () => {
    if (finalViewUrl) {
      router.push(finalViewUrl);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="text-5xl">{config.emoji}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-conexia-green mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600">
              Has publicado <span className="font-bold text-conexia-green">{current} de {limit}</span> {config.plural} permitidos en tu plan <span className="font-semibold">{planName}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Comparación de planes
          </h3>
          {plansLoading ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-3 text-sm`} style={{ gridTemplateColumns: `repeat(${plansData.length}, minmax(0, 1fr))` }}>
              {plansData.map((planData, index) => {
                const isBasic = planData.name.toLowerCase().includes('basic') || planData.name.toLowerCase().includes('básico');
                const isPremium = planData.name.toLowerCase().includes('premium');
                const isFree = planData.name.toLowerCase().includes('free') || planData.name.toLowerCase().includes('gratis');
                
                let bgColor = 'bg-gray-50';
                let borderColor = '';
                let textColor = 'text-gray-700';
                let labelColor = 'text-gray-500';
                
                if (isBasic) {
                  bgColor = 'bg-blue-50';
                  borderColor = 'border-2 border-blue-200';
                  textColor = 'text-blue-700';
                  labelColor = 'text-blue-600';
                } else if (isPremium) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-2 border-conexia-green';
                  textColor = 'text-conexia-green';
                  labelColor = 'text-conexia-green';
                }
                
                return (
                  <div key={index} className={`${bgColor} rounded-lg p-3 text-center ${borderColor}`}>
                    <div className={`text-xs ${labelColor} mb-1 ${!isFree ? 'font-semibold' : ''}`}>
                      {planData.name}
                    </div>
                    <div className={`font-bold ${textColor}`}>
                      {planData.limit} {typeof planData.limit === 'number' ? config.plural : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {finalViewUrl && (
            <Button
              variant="outline"
              onClick={handleViewPublications}
              className="w-full sm:w-auto"
            >
              {config.viewLabel}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleUpgradePlan}
            className="w-full sm:w-auto"
          >
            🚀 Actualizar plan
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 <span className="font-semibold">Consejo:</span> Puedes eliminar {config.plural} antiguos para liberar espacio, o actualizar tu plan para más capacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
