'use client';

import { useState, useEffect } from 'react';
import { applyToProject, cancelPostulation, getMyActivePostulationByProject, getMyPostulationByProject } from '@/service/postulations/postulationService';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';

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

  // Verificar estado real de la postulación al cargar
  useEffect(() => {
    const checkPostulationStatus = async () => {
      if (!user || isOwner || userRole !== ROLES.USER) {
        setCheckingStatus(false);
        setInitialLoad(false);
        return;
      }

      try {
        setCheckingStatus(true);
        
        // Verificar si existe cualquier postulación para este proyecto
        // Usar búsqueda exhaustiva en la carga inicial para asegurar que encontremos postulaciones canceladas
        const anyPostulation = await getMyPostulationByProject(projectId, true);
        
        if (anyPostulation) {
          console.log('Postulation found:', anyPostulation);
          setPostulationStatus(anyPostulation.status);
          // Solo está "aplicado" si la postulación está activa
          setIsApplied(anyPostulation.status.code === 'activo');
        } else {
          console.log('No postulation found for project', projectId);
          setPostulationStatus(null);
          setIsApplied(false);
        }
      } catch (error) {
        console.error('Error checking postulation status:', error);
        // Si hay error al verificar, usar el valor inicial como fallback
        setIsApplied(initialIsApplied);
        setPostulationStatus(null);
      } finally {
        setCheckingStatus(false);
        setInitialLoad(false);
      }
    };

    // Solo ejecutar si tenemos los datos necesarios
    if (user && userRole !== undefined) {
      checkPostulationStatus();
    }
  }, [projectId, user, isOwner, userRole, initialIsApplied]);

  // Función para postularse
  const handleApply = async (cvFile) => {
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
            console.log('Postulación anterior cancelada, permitiendo nueva postulación');
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
      } else if (err.message.includes('does not have the required role')) {
        setError('No tienes permisos para postularte a proyectos');
      } else if (err.message.includes('cannot apply to their own project')) {
        setError('No puedes postularte a tu propio proyecto');
      } else if (err.message.includes('not found')) {
        setError('El proyecto no existe');
      } else if (err.message.includes('is not active')) {
        setError('El proyecto no está activo');
      } else if (err.message.includes('has already ended')) {
        setError('El proyecto ya ha finalizado');
      } else if (err.message.includes('has already applied')) {
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
      
      // Actualizar el estado local inmediatamente
      setIsApplied(false);
      setPostulationStatus({ code: 'cancelada', name: 'Cancelada' });
      
      // Después de un breve retraso, verificar el estado real desde el backend
      setTimeout(async () => {
        try {
          const updatedPostulation = await getMyPostulationByProject(projectId);
          if (updatedPostulation) {
            setPostulationStatus(updatedPostulation.status);
            setIsApplied(updatedPostulation.status.code === 'activo');
          } else {
            // Si no se encuentra ninguna postulación, permitir postularse nuevamente
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
    } finally {
      setCheckingStatus(false);
    }
  };

  return {
    isApplied,
    loading: loading || checkingStatus,
    error,
    setError,
    handleApply,
    handleCancel,
    refreshPostulationStatus,
    checkingStatus,
    postulationStatus,
    initialLoad,
  };
};
