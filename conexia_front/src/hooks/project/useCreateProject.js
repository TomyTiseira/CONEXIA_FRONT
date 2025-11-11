// src/hooks/project/useCreateProject.js
'use client';

import { useState } from 'react';
import { createProject } from '@/service/project/projectFetch';

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publishProject = async (form) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('categoryId', form.category);
      formData.append('collaborationTypeId', form.collaborationType);
      formData.append('contractTypeId', form.contractType);

      if (form.skills && form.skills.length > 0) {
        form.skills.forEach((skill) => {
          const skillId = skill.id || skill;
          // Asegurar que el skillId sea un número válido
          const numericSkillId = parseInt(skillId, 10);
          if (!isNaN(numericSkillId) && numericSkillId > 0) {
            formData.append('skills[]', numericSkillId); // ✅ Agregado [] para indicar array
          }
        });
      }

      // Cambio aquí: enviar fechas como campos individuales
      if (form.dates.startDate) {
        formData.append('startDate', form.dates.startDate);
      }
      if (form.dates.endDate) {
        formData.append('endDate', form.dates.endDate);
      }

      if (form.location) {
        formData.append('location', form.location);
      }

      if (form.maxCollaborators) {
        formData.append('maxCollaborators', form.maxCollaborators);
      }

      if (form.image) {
        formData.append('image', form.image);
      }

      await createProject(formData);
    } catch (err) {
      // Crear un objeto de error con información adicional
      const errorObj = {
        message: err.message || 'Error al publicar el proyecto',
        statusCode: err.statusCode || null,
        isLimitExceeded: err.statusCode === 403 || err.message?.includes('límite'),
      };
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { publishProject, loading, error };
}