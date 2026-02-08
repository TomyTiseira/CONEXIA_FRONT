"use client";
// hooks/useSkills.js
import { useState, useEffect, useCallback } from 'react';
import { getSkills } from '@/service/skills/skillsFetch';

// Cache global para evitar múltiples llamadas
let skillsCache = null;
let skillsPromise = null;

export const useSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSkills = useCallback(async () => {
    try {
      // Si ya tenemos los datos en cache, usarlos
      if (skillsCache) {
        setSkills(skillsCache);
        setLoading(false);
        return;
      }

      // Si ya hay una petición en curso, esperarla
      if (skillsPromise) {
        const result = await skillsPromise;
        setSkills(result);
        setLoading(false);
        return;
      }

      // Crear nueva petición
      setLoading(true);
      skillsPromise = getSkills();
      const result = await skillsPromise;
      
      // Guardar en cache
      skillsCache = result;
      setSkills(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      skillsPromise = null;
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Función para refrescar el cache
  const refreshSkills = useCallback(() => {
    skillsCache = null;
    skillsPromise = null;
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    error,
    refreshSkills
  };
};
