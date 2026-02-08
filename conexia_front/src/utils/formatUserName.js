/**
 * Formatea el nombre del usuario mostrando solo el primer nombre y primer apellido
 * @param {string} name - Nombre completo del usuario
 * @param {string} lastName - Apellido completo del usuario
 * @returns {string} Primer nombre y primer apellido
 */
export const formatUserName = (name, lastName) => {
  const firstName = (name || '').trim().split(/\s+/)[0] || '';
  const firstLastName = (lastName || '').trim().split(/\s+/)[0] || '';
  
  return `${firstName} ${firstLastName}`.trim() || 'Usuario';
};

/**
 * Obtiene el nombre formateado desde un objeto user/client
 * @param {Object} user - Objeto usuario con propiedades name/firstName y lastName
 * @returns {string} Primer nombre y primer apellido
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Usuario';
  // Soportar tanto 'name' como 'firstName'
  const name = user.name || user.firstName || '';
  const lastName = user.lastName || '';
  return formatUserName(name, lastName);
};