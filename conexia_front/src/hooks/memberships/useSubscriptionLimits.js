'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserPlan } from './useUserPlan';
import { fetchMyProjects } from '@/service/projects/projectsFetch';
import { fetchUserServices } from '@/service/services/servicesFetch';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para validar límites de publicación de proyectos y servicios
 * según el plan de suscripción activo del usuario
 * 
 * @returns {Object} - Estado de límites y métodos de validación
 * @property {Object} projectsLimit - Información del límite de proyectos
 * @property {number} projectsLimit.current - Cantidad actual de proyectos publicados
 * @property {number} projectsLimit.limit - Límite permitido por el plan
 * @property {boolean} projectsLimit.canPublish - Si puede publicar más proyectos
 * @property {string|null} projectsLimit.message - Mensaje de error si alcanzó el límite
 * 
 * @property {Object} servicesLimit - Información del límite de servicios
 * @property {number} servicesLimit.current - Cantidad actual de servicios publicados
 * @property {number} servicesLimit.limit - Límite permitido por el plan
 * @property {boolean} servicesLimit.canPublish - Si puede publicar más servicios
 * @property {string|null} servicesLimit.message - Mensaje de error si alcanzó el límite
 * 
 * @property {boolean} isLoading - Estado de carga
 * @property {string|null} error - Mensaje de error general
 * @property {Function} refetch - Función para refrescar los datos
 * @property {Function} validateCanPublishProject - Validar si puede publicar un proyecto
 * @property {Function} validateCanPublishService - Validar si puede publicar un servicio
 */
export function useSubscriptionLimits() {
  const { user } = useAuth();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  
  // No establecer valores por defecto - esperar a tener datos reales
  const [projectsLimit, setProjectsLimit] = useState(null);
  const [servicesLimit, setServicesLimit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Obtener el beneficio específico del plan
   */
  const getBenefitValue = useCallback((benefitKey) => {
    if (!userPlan?.plan?.benefits) return 0;
    
    const benefit = userPlan.plan.benefits.find(b => b.key === benefitKey);
    return benefit?.value || 0;
  }, [userPlan]);

  /**
   * Cargar límites de proyectos y servicios
   */
  const fetchLimits = useCallback(async () => {
    if (!user?.id || planLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Obtener límites del plan
      const publishProjectsLimit = getBenefitValue('publish_projects');
      const publishServicesLimit = getBenefitValue('publish_services');

      // Obtener cantidad actual de proyectos activos
      const projectsResponse = await fetchMyProjects({ 
        ownerId: user.id, 
        active: true, 
        page: 1, 
        limit: 100 // Suficiente para contar todos
      });
      const currentProjects = projectsResponse?.projects?.length || 0;

      // Obtener cantidad actual de servicios activos
      const servicesResponse = await fetchUserServices(user.id, { 
        includeInactive: false, 
        page: 1, 
        limit: 100 
      });
      const currentServices = servicesResponse?.services?.length || 0;

      // Calcular estado de proyectos
      const canPublishProjects = currentProjects < publishProjectsLimit;
      setProjectsLimit({
        current: currentProjects,
        limit: publishProjectsLimit,
        canPublish: canPublishProjects,
        message: canPublishProjects 
          ? null 
          : `Has alcanzado el límite de proyectos publicados (${currentProjects}/${publishProjectsLimit}). Actualiza tu plan de suscripción para publicar más proyectos.`,
      });

      // Calcular estado de servicios
      const canPublishServices = currentServices < publishServicesLimit;
      setServicesLimit({
        current: currentServices,
        limit: publishServicesLimit,
        canPublish: canPublishServices,
        message: canPublishServices 
          ? null 
          : `Has alcanzado el límite de servicios publicados (${currentServices}/${publishServicesLimit}). Actualiza tu plan de suscripción para publicar más servicios.`,
      });

    } catch (err) {
      const errorMessage = err.message || 'Error al cargar los límites de suscripción';
      setError(errorMessage);
      console.error('Error fetching subscription limits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, planLoading, getBenefitValue]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  /**
   * Validar si el usuario puede publicar un proyecto
   * @returns {Promise<Object>} Resultado de la validación
   */
  const validateCanPublishProject = useCallback(async () => {
    // Refrescar datos antes de validar
    await fetchLimits();
    
    return {
      canPublish: projectsLimit.canPublish,
      current: projectsLimit.current,
      limit: projectsLimit.limit,
      message: projectsLimit.message,
    };
  }, [fetchLimits, projectsLimit]);

  /**
   * Validar si el usuario puede publicar un servicio
   * @returns {Promise<Object>} Resultado de la validación
   */
  const validateCanPublishService = useCallback(async () => {
    // Refrescar datos antes de validar
    await fetchLimits();
    
    return {
      canPublish: servicesLimit.canPublish,
      current: servicesLimit.current,
      limit: servicesLimit.limit,
      message: servicesLimit.message,
    };
  }, [fetchLimits, servicesLimit]);

  const refetch = useCallback(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Valores seguros para retornar - nunca mostrar 0/0 si no hay datos
  const safeProjectsLimit = projectsLimit || {
    current: 0,
    limit: 0,
    canPublish: true, // Por defecto permitir hasta tener datos reales
    message: null,
  };

  const safeServicesLimit = servicesLimit || {
    current: 0,
    limit: 0,
    canPublish: true, // Por defecto permitir hasta tener datos reales
    message: null,
  };

  return {
    projectsLimit: safeProjectsLimit,
    servicesLimit: safeServicesLimit,
    isLoading: isLoading || planLoading,
    hasData: projectsLimit !== null && servicesLimit !== null, // Nuevo flag
    error,
    refetch,
    validateCanPublishProject,
    validateCanPublishService,
    planName: userPlan?.plan?.name || 'Free',
  };
}
