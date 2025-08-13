// Utilidades para validar el estado de los proyectos

export const validateProjectForPostulation = (project, user) => {
  const errors = [];
  
  if (!project) {
    errors.push('El proyecto no existe');
    return { isValid: false, errors };
  }

  // Verificar que el proyecto está activo
  if (!project.isActive || project.status !== 'active') {
    errors.push('El proyecto no está activo');
  }

  // Verificar fecha de fin si existe
  if (project.endDate) {
    const endDate = new Date(project.endDate);
    const now = new Date();
    if (endDate < now) {
      errors.push('El proyecto ya ha finalizado');
    }
  }

  // Verificar que no es el dueño
  if (user && project && (String(user.id) === String(project.ownerId) || project.isOwner)) {
    errors.push('No puedes postularte a tu propio proyecto');
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
