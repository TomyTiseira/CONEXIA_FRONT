
"use client";

import React, { useState, useEffect } from 'react';
import { applyToProjectRole, cancelPostulation, getMyActivePostulationByProject, getMyPostulationByProject, getMyPostulationsByProjectAndRole } from '@/service/postulations/postulationService';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';
import { validateProjectForPostulation } from '@/utils/postulationValidation';

/**
 * Hook para manejar postulaciones a roles específicos de un proyecto
 * Soporta múltiples postulaciones por usuario (a diferentes roles del mismo proyecto)
 * 
 * @param {number} projectId - ID del proyecto
 * @param {number} roleId - ID del rol específico (opcional)
 * @param {boolean} isOwner - Si el usuario es dueño del proyecto
 * @param {boolean} initialIsApplied - Estado inicial de aplicación
 */
export const usePostulation = (projectId, roleId = null, isOwner = false, initialIsApplied = false) => {
  const [isApplied, setIsApplied] = useState(initialIsApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [postulationStatus, setPostulationStatus] = useState(null);
  const [postulations, setPostulations] = useState([]); // Todas las postulaciones del proyecto
  const [rolePostulation, setRolePostulation] = useState(null); // Postulación del rol específico
  const [initialLoad, setInitialLoad] = useState(true);
  const { user } = useAuth();
  
  // Obtener el rol del usuario
  const userId = user?.roleId || null;
  const { role: userRole } = useRole(userId);

  // Función para verificar estado de postulación al cargar
  const checkPostulationStatus = React.useCallback(async () => {
    if (!user || isOwner || userRole !== ROLES.USER) {
      setCheckingStatus(false);
      setInitialLoad(false);
      return;
    }

    try {
      setCheckingStatus(true);
      
      if (roleId) {
        // Si se especifica un roleId, verificar postulación para ese rol específico
        const rolePostulations = await getMyPostulationsByProjectAndRole(projectId, roleId);
        setPostulations(rolePostulations);
        
        if (rolePostulations.length > 0) {
          // Usar la postulación más reciente
          const latestPostulation = rolePostulations[0];
          setRolePostulation(latestPostulation);
          setPostulationStatus(latestPostulation.status);
          setIsApplied(latestPostulation.status.code === 'activo');
        } else {
          setRolePostulation(null);
          setPostulationStatus(null);
          setIsApplied(false);
        }
      } else {
        // Sin roleId, verificar si existe cualquier postulación para este proyecto
        const anyPostulation = await getMyPostulationByProject(projectId);
        if (anyPostulation) {
          setPostulationStatus(anyPostulation.status);
          setIsApplied(anyPostulation.status.code === 'activo');
        } else {
          setPostulationStatus(null);
          setIsApplied(false);
        }
      }
    } catch (error) {
      console.error('Error checking postulation status:', error);
      setPostulationStatus(null);
      setIsApplied(initialIsApplied);
    } finally {
      setCheckingStatus(false);
      setInitialLoad(false);
    }
  }, [user, isOwner, userRole, projectId, roleId, initialIsApplied]);

  useEffect(() => {
    if (user && userRole !== undefined) {
      checkPostulationStatus();
    }
  }, [projectId, roleId, user, isOwner, userRole, initialIsApplied, checkPostulationStatus]);

  // Función para postularse (versión antigua mantenida por compatibilidad)
  const handleApply = async (cvFile, project = null) => {
    // Validar el estado del proyecto si se proporciona
    if (project) {
      const validation = validateProjectForPostulation(project, { role: 'USER' });
      if (!validation.isValid) {
        setError(validation.errors[0]);
        return false;
      }
    }

    // Verificar el estado actual antes de postularse
    try {
      const currentPostulation = roleId 
        ? (await getMyPostulationsByProjectAndRole(projectId, roleId))[0]
        : await getMyPostulationByProject(projectId);
        
      if (currentPostulation) {
        switch (currentPostulation.status.code) {
          case 'activo':
            setError('Ya tienes una postulación activa para este rol');
            return false;
          case 'aceptada':
            setError('Tu postulación ya fue aceptada para este rol');
            return false;
          case 'rechazada':
            setError('Tu postulación anterior fue rechazada. No puedes postularte nuevamente a este rol');
            return false;
          case 'cancelada':
            // Permitir postularse nuevamente si fue cancelada
            break;
          default:
            setError('Ya te has postulado a este rol anteriormente');
            return false;
        }
      }
    } catch (error) {
      console.error('Error verificando estado de postulación:', error);
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
      // Si se especifica roleId, usar la nueva función
      if (roleId) {
        await applyToProjectRole({ projectId, roleId, cv: cvFile });
      } else {
        // Compatibilidad con código antiguo
        await applyToProjectRole({ projectId, cv: cvFile });
      }
      
      setIsApplied(true);
      setPostulationStatus({ code: 'activo', name: 'Activa' });
      
      // Actualizar la postulación del rol si se especifica
      if (roleId) {
        await checkPostulationStatus();
      }
      
      return true;
    } catch (err) {
      console.error('Error al postularse:', err);
      
      // Manejar errores específicos del backend
      if (err.message.includes('reached the maximum number of collaborators')) {
        setError('Este rol ya alcanzó el número máximo de colaboradores. No hay vacantes disponibles.');
      } else if (err.message.includes('Only PDF files are allowed')) {
        setError('Solo se permiten archivos PDF para el CV');
      } else if (err.message.includes('CV file is required')) {
        setError('El archivo CV es requerido');
      } else if (err.message.includes('CV file size cannot exceed 10MB')) {
        setError('El archivo CV no puede superar los 10MB');
      } else if (err.message.includes('already exists for this project') || err.message.includes('already applied')) {
        // Si el backend dice que ya existe una postulación
        // Actualizar el estado local para reflejar que ya se postuló
        await checkPostulationStatus();
        setError('Ya te has postulado a este rol anteriormente');
      } else {
        setError('Error al postularse al proyecto. Intenta nuevamente.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Nueva función para aplicar con datos completos de postulación
   * Soporta CV, preguntas, evaluación técnica, socios e inversores
   */
  const applyToRole = async (applicationData) => {
    setLoading(true);
    setError(null);

    try {
      // Validar que se especifique roleId
      if (!applicationData.roleId) {
        throw new Error('El ID del rol es requerido');
      }

      // Verificar estado actual antes de postularse
      const existingPostulations = await getMyPostulationsByProjectAndRole(projectId, applicationData.roleId);
      const activePostulation = existingPostulations.find(p => 
        ['activo', 'aceptada', 'pendiente'].includes(p.status?.code)
      );

      if (activePostulation) {
        setError(`Ya tienes una postulación ${activePostulation.status.name} para este rol`);
        return { success: false, error: `Ya tienes una postulación ${activePostulation.status.name} para este rol` };
      }

      // Realizar la postulación
      const result = await applyToProjectRole({
        projectId,
        ...applicationData
      });

      if (result.success) {
        setIsApplied(true);
        setPostulationStatus({ code: 'activo', name: 'Activa' });
        await checkPostulationStatus();
        return { success: true, data: result.data };
      } else {
        setError(result.message || 'Error al postularse');
        return { success: false, error: result.message };
      }
    } catch (err) {
      console.error('Error al postularse:', err);
      
      // Manejar errores específicos
      let errorMessage = err.message || 'Error al postularse al proyecto';
      if (err.message.includes('reached the maximum number of collaborators')) {
        errorMessage = 'Este rol ya alcanzó el número máximo de colaboradores. No hay vacantes disponibles.';
      } else if (err.message.includes('already applied') || err.message.includes('already exists')) {
        errorMessage = 'Ya te has postulado a este rol anteriormente';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar postulación
  const handleCancel = async (postulationIdToCancel = null) => {
    setLoading(true);
    setError(null);

    try {
      let postulationToCancel = postulationIdToCancel;
      
      // Si no se especifica ID, buscar la postulación activa
      if (!postulationToCancel) {
        if (roleId) {
          // Buscar postulación activa para el rol específico
          const rolePostulations = await getMyPostulationsByProjectAndRole(projectId, roleId);
          const activeRolePostulation = rolePostulations.find(p => p.status.code === 'activo');
          postulationToCancel = activeRolePostulation?.id;
        } else {
          // Buscar cualquier postulación activa para el proyecto
          const activePostulation = await getMyActivePostulationByProject(projectId);
          postulationToCancel = activePostulation?.id;
        }
      }
      
      if (!postulationToCancel) {
        throw new Error('No se encontró una postulación activa para cancelar');
      }
      
      // Cancelar usando el ID de la postulación
      await cancelPostulation(postulationToCancel);
      
      // Actualizar el estado local inmediatamente
      setIsApplied(false);
      setPostulationStatus(null);
      setRolePostulation(null);
      
      // Verificar el estado real desde el backend después de un breve retraso
      setTimeout(async () => {
        await checkPostulationStatus();
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Error al cancelar postulación:', err);
      
      // Manejar errores específicos
      if (err.message.includes('No se encontró una postulación activa')) {
        setError('No tienes una postulación activa para este rol');
      } else if (err.message.includes('cannot be cancelled')) {
        setError('Esta postulación no puede ser cancelada en su estado actual');
      } else if (err.message.includes('not authorized')) {
        setError('No tienes permisos para cancelar esta postulación');
      } else {
        setError('Error al cancelar postulación. Intenta nuevamente.');
      }
      
      // En caso de error, verificar el estado real
      await checkPostulationStatus();
      
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

    await checkPostulationStatus();
  };

  return {
    isApplied,
    loading,
    error,
    setError,
    handleApply,
    applyToRole, // Nueva función para aplicar con datos completos
    handleCancel,
    checkingStatus,
    postulationStatus,
    postulations, // Todas las postulaciones al proyecto
    rolePostulation, // Postulación específica al rol
    initialLoad,
    refreshPostulationStatus,
  };
};
