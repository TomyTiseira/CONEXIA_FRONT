'use client';

import { useState, useEffect } from 'react';
import { applyToProject, cancelPostulation } from '@/service/postulations';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';

export const usePostulation = (projectId, isOwner, initialIsApplied = false) => {
  const [isApplied, setIsApplied] = useState(initialIsApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Obtener el rol del usuario
  const roleId = user?.roleId || null;
  const { role: userRole } = useRole(roleId);

  // Actualizar isApplied cuando cambie initialIsApplied
  useEffect(() => {
    setIsApplied(initialIsApplied);
  }, [initialIsApplied]);

  // Función para postularse
  const handleApply = async (cvFile) => {
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
        setError('Ya te has postulado a este proyecto');
        setIsApplied(true);
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
      await cancelPostulation(projectId);
      setIsApplied(false);
      return true;
    } catch (err) {
      console.error('Error al cancelar postulación:', err);
      setError('Error al cancelar postulación. Intenta nuevamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isApplied,
    loading,
    error,
    setError,
    handleApply,
    handleCancel,
  };
};
