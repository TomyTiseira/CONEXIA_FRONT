'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionLimits } from '@/hooks/memberships';
import Button from '@/components/ui/Button';

export default function SubscriptionLimitsIndicator({ className = '', showOnly = 'both' }) {
  const router = useRouter();
  
  const { 
    projectsLimit, 
    servicesLimit, 
    isLoading, 
    planName 
  } = useSubscriptionLimits();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <><div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div><div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded"></div>
          {showOnly === 'both' && <div className="h-16 bg-gray-100 rounded"></div>}
        </div></>
      </div>
    );
  }

  const getProgressColor = (current, limit) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-conexia-green';
  };

  const getProgressPercentage = (current, limit) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const shouldShowCTA = () => {
    if (showOnly === 'projects') return !projectsLimit.canPublish;
    if (showOnly === 'services') return !servicesLimit.canPublish;
    return !projectsLimit.canPublish || !servicesLimit.canPublish;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          📊 Tu plan: <span className="text-conexia-green">{planName}</span>
        </h3>
      </div>

      {(showOnly === 'both' || showOnly === 'projects') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📁</span>
              <span className="text-sm font-medium text-gray-700">Proyectos</span>
            </div>
            <span className={`text-sm font-bold ${projectsLimit.canPublish ? 'text-conexia-green' : 'text-red-600'}`}>
              {projectsLimit.current}/{projectsLimit.limit}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(projectsLimit.current, projectsLimit.limit)}`}
              style={{ width: `${getProgressPercentage(projectsLimit.current, projectsLimit.limit)}%` }}
            ></div>
          </div>

          {!projectsLimit.canPublish && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Has alcanzado el límite
            </p>
          )}
        </div>
      )}

      {(showOnly === 'both' || showOnly === 'services') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <span className="text-sm font-medium text-gray-700">Servicios</span>
            </div>
            <span className={`text-sm font-bold ${servicesLimit.canPublish ? 'text-conexia-green' : 'text-red-600'}`}>
              {servicesLimit.current}/{servicesLimit.limit}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(servicesLimit.current, servicesLimit.limit)}`}
              style={{ width: `${getProgressPercentage(servicesLimit.current, servicesLimit.limit)}%` }}
            ></div>
          </div>

          {!servicesLimit.canPublish && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Has alcanzado el límite
            </p>
          )}
        </div>
      )}

      {shouldShowCTA() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={() => router.push('/settings/my-plan')}
            className="w-full text-sm"
          >
            🚀 Actualizar plan
          </Button>
        </div>
      )}
    </div>
  );
}
