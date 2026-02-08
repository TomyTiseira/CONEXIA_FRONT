// Utilidades para validar el estado de los proyectos

// Función para verificar si un proyecto ha finalizado
export const isProjectFinished = (project) => {
  if (!project || !project.endDate) {
    return false; // Si no tiene fecha de fin, no ha finalizado
  }
  
  const endDate = new Date(project.endDate);
  const now = new Date();
  // Comparar solo fechas, sin horas
  endDate.setHours(23, 59, 59, 999); // Fin del día
  return now > endDate;
};

export const validateProjectForPostulation = (project, user) => {
  const errors = [];
  
  if (!project) {
    errors.push('El proyecto no existe');
    return { isValid: false, errors };
  }

  // Verificar que el proyecto está activo (solo verificar isActive, el backend maneja el status)
  if (project.isActive === false) {
    errors.push('El proyecto no está activo');
  }

  // Verificar si el proyecto ha finalizado por fecha
  if (isProjectFinished(project)) {
    errors.push('El proyecto ya ha finalizado');
  }

  // Verificar que no es el dueño
  if (user && project && (String(user.id) === String(project.ownerId) || project.isOwner)) {
    errors.push('No puedes postularte a tu propio proyecto');
  }

  // Verificar cupo completo (solo si el usuario no está postulado)
  if (
    typeof project.maxCollaborators === 'number' &&
    typeof project.approvedApplications === 'number' &&
    project.approvedApplications >= project.maxCollaborators &&
    !(project.isApplied) // permitir si el usuario ya está postulado
  ) {
    errors.push('El proyecto ya alcanzó el cupo de colaboradores');
  }

  // Verificar rol de usuario
  if (!user || user.role !== 'USER') {
    errors.push('Debes tener rol de usuario para postularte');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCVFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('El archivo CV es requerido');
    return { isValid: false, errors };
  }

  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    errors.push('Solo se permiten archivos PDF para el CV');
  }

  // Validar tamaño (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB en bytes
  if (file.size > maxSize) {
    errors.push('El archivo CV no puede superar los 10MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
