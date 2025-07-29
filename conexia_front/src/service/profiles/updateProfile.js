import { fetchWithRefresh } from "../auth/fetchWithRefresh";
import { config } from "@/config";

export async function updateUserProfile(payload) {
  try {
    // Verificar si hay archivos (imágenes) en el payload
    const hasFiles = (payload.profilePicture instanceof File) || (payload.coverPicture instanceof File);
    
    if (hasFiles) {
      // Si hay archivos, usar FormData
      const formData = new FormData();
      
      // Solo agregar campos que tienen valores (que se están actualizando)
      const textFields = ['name', 'lastName', 'birthDate', 'phoneNumber', 'country', 'state', 'description', 'profession'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined && payload[field] !== '') {
          formData.append(field, payload[field]);
        }
      });
      
      // Solo agregar arrays si tienen contenido
      ['skills', 'experience', 'socialLinks', 'education', 'certifications'].forEach(field => {
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
      
      // Usar fetchWithRefresh que maneja automáticamente las cookies/JWT
      const res = await fetchWithRefresh(`${config.API_URL}/users/profile`, {
        method: "PATCH",
        body: formData,
        // No incluir Content-Type, FormData lo maneja automáticamente
      });
      
      return await handleResponse(res);
      
    } else {
      // Si NO hay archivos, enviar como JSON puro solo con campos que tienen valores
      const jsonPayload = {};
      
      // Solo incluir campos de texto que tienen valores
      const textFields = ['name', 'lastName', 'birthDate', 'phoneNumber', 'country', 'state', 'description', 'profession'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined && payload[field] !== '') {
          jsonPayload[field] = payload[field];
        }
      });
      
      // Solo incluir arrays que tienen contenido
      ['skills', 'experience', 'socialLinks', 'education', 'certifications'].forEach(field => {
        if (payload[field] && Array.isArray(payload[field]) && payload[field].length > 0) {
          jsonPayload[field] = payload[field];
        }
      });
      
      // Usar fetchWithRefresh que maneja automáticamente las cookies/JWT
      const res = await fetchWithRefresh(`${config.API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonPayload),
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
  const response = await res.json();
  
  if (!res.ok) {
    console.error('Error del backend:', {
      status: res.status,
      statusText: res.statusText,
      response: response
    });
    
    throw new Error(response.message || "Error al actualizar perfil");
  }
  return response;
}
