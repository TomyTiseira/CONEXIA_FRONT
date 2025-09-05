
"use client";

import React, { useState, useEffect } from 'react';
import { applyToProject, cancelPostulation, getMyActivePostulationByProject, getMyPostulationByProject } from '@/service/postulations/postulationService';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';
import { validateProjectForPostulation } from '@/utils/postulationValidation';

export const usePostulation = (projectId, isOwner, initialIsApplied = false) => {
  const [isApplied, setIsApplied] = useState(initialIsApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [postulationStatus, setPostulationStatus] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { user } = useAuth();
  
  // Obtener el rol del usuario
  const roleId = user?.roleId || null;
  const { role: userRole } = useRole(roleId);

  // Función para verificar estado de postulación al cargar
  const checkPostulationStatus = React.useCallback(async () => {
    if (!user || isOwner || userRole !== ROLES.USER) {
      setCheckingStatus(false);
      setInitialLoad(false);
      return;
    }

    try {
      setCheckingStatus(true);
      // Verificar si existe cualquier postulación para este proyecto
      const anyPostulation = await getMyPostulationByProject(projectId);
      if (anyPostulation) {
        setPostulationStatus(anyPostulation.status);
        // Solo está "aplicado" si la postulación está activa
        setIsApplied(anyPostulation.status.code === 'activo');
      } else {
        setPostulationStatus(null);
        setIsApplied(false);
      }
    } catch (error) {
      console.error('Error checking postulation status:', error);
      setPostulationStatus(null);
      setIsApplied(initialIsApplied);
    } finally {
      setCheckingStatus(false);
      setInitialLoad(false);
    }
  }, [user, isOwner, userRole, projectId, initialIsApplied]);

  useEffect(() => {
      if (user && userRole !== undefined) {
        checkPostulationStatus();
      }
    }, [projectId, user, isOwner, userRole, initialIsApplied, checkPostulationStatus]);

  // Función para postularse
  const handleApply = async (cvFile, project = null) => {
    // Validar el estado del proyecto si se proporciona
    if (project) {
      const validation = validateProjectForPostulation(project, { role: 'USER' });
      if (!validation.isValid) {
        setError(validation.errors[0]); // Mostrar el primer error
        return false;
      }
    }

    // Verificar el estado actual antes de postularse
    try {
      const currentPostulation = await getMyPostulationByProject(projectId);
      if (currentPostulation) {
        switch (currentPostulation.status.code) {
          case 'activo':
            setError('Ya tienes una postulación activa para este proyecto');
            return false;
          case 'aceptada':
            setError('Tu postulación ya fue aceptada para este proyecto');
            return false;
          case 'rechazada':
            setError('Tu postulación anterior fue rechazada. No puedes postularte nuevamente a este proyecto');
            return false;
          case 'cancelada':
            // Permitir postularse nuevamente si fue cancelada
            break;
          default:
            setError('Ya te has postulado a este proyecto anteriormente');
            return false;
        }
      }
    } catch (error) {
      console.error('Error verificando estado de postulación:', error);
      // Continuar con la postulación si no se puede verificar el estado
    }

    if (!cvFile) {
      setError('Debes seleccionar un archivo CV');
      return false;
    }

    // Validaciones del archivo
    if (cvFile.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF para el CV');
      return false;
    }

    if (cvFile.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo CV no puede superar los 10MB');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await applyToProject(projectId, cvFile);
      setIsApplied(true);
      setPostulationStatus({ code: 'activo', name: 'Activa' });
      return true;
    } catch (err) {
      console.error('Error al postularse:', err);
      
      // Manejar errores específicos del backend
      if (err.message.includes('Only PDF files are allowed')) {
        setError('Solo se permiten archivos PDF para el CV');
      } else if (err.message.includes('CV file is required')) {
        setError('El archivo CV es requerido');
      } else if (err.message.includes('CV file size cannot exceed 10MB')) {
        setError('El archivo CV no puede superar los 10MB');
      } else if (err.message.includes('already exists for this project')) {
        // Si el backend dice que ya existe una postulación
        // Actualizar el estado local para reflejar que ya se postuló
        const existingPostulation = await getMyPostulationByProject(projectId);
        if (existingPostulation) {
          setPostulationStatus(existingPostulation.status);
          setIsApplied(existingPostulation.status.code === 'activo');
        }
        setError('Ya te has postulado a este proyecto anteriormente');
      } else {
        setError('Error al postularse al proyecto. Intenta nuevamente.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar postulación
  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      // Primero obtenemos la postulación activa para este proyecto
      const activePostulation = await getMyActivePostulationByProject(projectId);
      
      if (!activePostulation) {
        throw new Error('No se encontró una postulación activa para este proyecto');
      }
      
      // Cancelamos usando el ID de la postulación
      await cancelPostulation(activePostulation.id);
      
      // Actualizar el estado local inmediatamente para permitir postularse de nuevo
      setIsApplied(false);
      setPostulationStatus(null); // Reset to null to allow applying again
      
      // Después de un breve retraso, verificar el estado real desde el backend
      setTimeout(async () => {
        try {
          const updatedPostulation = await getMyPostulationByProject(projectId);
          if (updatedPostulation && updatedPostulation.status.code !== 'cancelada') {
            setPostulationStatus(updatedPostulation.status);
            setIsApplied(updatedPostulation.status.code === 'activo');
          } else {
            // Si no se encuentra ninguna postulación o está cancelada, permitir postularse nuevamente
            setPostulationStatus(null);
            setIsApplied(false);
          }
        } catch (error) {
          console.error('Error verifying cancellation:', error);
        }
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Error al cancelar postulación:', err);
      
      // Manejar errores específicos
      if (err.message.includes('No se encontró una postulación activa')) {
        setError('No tienes una postulación activa para este proyecto');
      } else if (err.message.includes('cannot be cancelled')) {
        setError('Esta postulación no puede ser cancelada en su estado actual');
      } else if (err.message.includes('not authorized')) {
        setError('No tienes permisos para cancelar esta postulación');
      } else {
        setError('Error al cancelar postulación. Intenta nuevamente.');
      }
      
      // En caso de error, verificar el estado real
      try {
        const currentPostulation = await getMyPostulationByProject(projectId);
        if (currentPostulation) {
          setPostulationStatus(currentPostulation.status);
          setIsApplied(currentPostulation.status.code === 'activo');
        }
      } catch (statusError) {
        console.error('Error checking status after cancel failure:', statusError);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar el estado de la postulación
  const refreshPostulationStatus = async () => {
    if (!user || isOwner || userRole !== ROLES.USER) {
      return;
    }

    try {
      setCheckingStatus(true);
      
      // Verificar si existe cualquier postulación para este proyecto
      const anyPostulation = await getMyPostulationByProject(projectId, true);
      
      if (anyPostulation) {
        setPostulationStatus(anyPostulation.status);
        // Solo está "aplicado" si la postulación está activa
        setIsApplied(anyPostulation.status.code === 'activo');
      } else {
        setPostulationStatus(null);
        setIsApplied(false);
      }
    } catch (error) {
      console.error('Error refreshing postulation status:', error);
      setPostulationStatus(null);
      setIsApplied(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  return {
    isApplied,
    loading,
    error,
    setError,
    handleApply,
    handleCancel,
    checkingStatus,
    postulationStatus,
    initialLoad,
    refreshPostulationStatus,
  };
};
