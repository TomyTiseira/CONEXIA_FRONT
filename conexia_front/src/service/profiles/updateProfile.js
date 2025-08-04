import { fetchWithRefresh } from "../auth/fetchWithRefresh";
import { config } from "@/config";

export async function updateUserProfile(payload) {
  try {
    // Verificar si hay archivos (imágenes) en el payload
    const hasFiles = (payload.profilePicture instanceof File) || (payload.coverPicture instanceof File);
    
    if (hasFiles) {
      // Si hay archivos, usar FormData
      const formData = new FormData();
      
      // Solo incluir campos de texto que tienen valores o que están siendo vaciados intencionalmente
      const textFields = ['name', 'lastName', 'birthDate', 'phoneNumber', 'country', 'state', 'description', 'profession'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined) {
          formData.append(field, payload[field]);
        }
      });
      
      // Incluir arrays si están presentes en el payload (incluso si están vacíos)
      ['skills', 'experience', 'socialLinks', 'education', 'certifications'].forEach(field => {
        if (payload.hasOwnProperty(field) && Array.isArray(payload[field])) {
          let processedArray = payload[field];
          
          // Convertir skills a array de IDs si contiene objetos
          if (field === 'skills' && payload[field].length > 0 && typeof payload[field][0] === 'object') {
            processedArray = payload[field].map(skill => skill.id);
          }
          
          formData.append(field, JSON.stringify(processedArray));
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
      
      // Solo incluir campos de texto que tienen valores o que están siendo vaciados intencionalmente
      const textFields = ['name', 'lastName', 'birthDate', 'phoneNumber', 'country', 'state', 'description', 'profession'];
      textFields.forEach(field => {
        if (payload[field] !== null && payload[field] !== undefined) {
          jsonPayload[field] = payload[field];
        }
      });
      
      // Incluir arrays si están presentes en el payload (incluso si están vacíos)
      ['skills', 'experience', 'socialLinks', 'education', 'certifications'].forEach(field => {
        if (payload.hasOwnProperty(field) && Array.isArray(payload[field])) {
          let processedArray = payload[field];
          
          // Convertir skills a array de IDs si contiene objetos
          if (field === 'skills' && payload[field].length > 0 && typeof payload[field][0] === 'object') {
            processedArray = payload[field].map(skill => skill.id);
          }
          
          jsonPayload[field] = processedArray;
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
