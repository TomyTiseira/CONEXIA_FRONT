import { config } from "@/config";

export async function updateUserProfile(payload) {
  try {
    // Debug: mostrar los datos que se van a enviar
    console.log('Payload antes de procesar:', JSON.stringify(payload, null, 2));
    
    // Verificar si hay archivos (imágenes) en el payload
    const hasFiles = (payload.profilePicture instanceof File) || (payload.coverPicture instanceof File);
    
    if (hasFiles) {
      // Si hay archivos, usar FormData
      const formData = new FormData();
      
      // Solo agregar campos que tienen valores (que se están actualizando)
      const textFields = ['name', 'lastName', 'phoneNumber', 'country', 'state', 'description'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined && payload[field] !== '') {
          formData.append(field, payload[field]);
        }
      });
      
      // Solo agregar arrays si tienen contenido
      ['skills', 'experience', 'socialLinks'].forEach(field => {
        if (payload[field] && Array.isArray(payload[field]) && payload[field].length > 0) {
          formData.append(field, JSON.stringify(payload[field]));
        }
      });
      
      // Agregar archivos
      if (payload.profilePicture instanceof File) {
        formData.append('profilePicture', payload.profilePicture);
      }
      if (payload.coverPicture instanceof File) {
        formData.append('coverPicture', payload.coverPicture);
      }

      console.log('Enviando con FormData (con archivos)');
      
      const res = await fetch(`${config.API_URL}/users/profile`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      
      return await handleResponse(res);
      
    } else {
      // Si NO hay archivos, enviar como JSON puro solo con campos que tienen valores
      const jsonPayload = {};
      
      // Solo incluir campos de texto que tienen valores
      const textFields = ['name', 'lastName', 'phoneNumber', 'country', 'state', 'description'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined && payload[field] !== '') {
          jsonPayload[field] = payload[field];
        }
      });
      
      // Solo incluir arrays que tienen contenido
      ['skills', 'experience', 'socialLinks'].forEach(field => {
        if (payload[field] && Array.isArray(payload[field]) && payload[field].length > 0) {
          jsonPayload[field] = payload[field];
        }
      });
      
      console.log('Enviando como JSON puro (solo campos modificados):', JSON.stringify(jsonPayload, null, 2));
      
      const res = await fetch(`${config.API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonPayload),
        credentials: "include",
      });
      
      return await handleResponse(res);
    }
    
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error;
  }
}

// Función auxiliar para manejar la respuesta
async function handleResponse(res) {
  console.log('Respuesta recibida - Status:', res.status);
  
  const response = await res.json();
  
  // Debug: mostrar la respuesta completa del servidor
  console.log('Respuesta del servidor:', response);
  
  if (!res.ok) {
    // Mostrar error detallado en consola
    console.error('Error del backend:', {
      status: res.status,
      statusText: res.statusText,
      response: response
    });
    
    // Si hay errores de validación específicos, mostrarlos
    if (response.errors) {
      console.error('Errores de validación:', JSON.stringify(response.errors, null, 2));
    }
    
    throw new Error(response.message || "Error al actualizar perfil");
  }
  return response;
}
