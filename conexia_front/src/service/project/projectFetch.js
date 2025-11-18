import { config } from '@/config';

export async function fetchProjectCategories() {
  const res = await fetch(`${config.API_URL}/projects/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener las categorías');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de categorías');
  return response.data;
}

export async function fetchCollaborationTypes() {
  const res = await fetch(`${config.API_URL}/projects/collaboration-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de colaboración');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de tipos de colaboración');
  return response.data;
}

export async function fetchContractTypes() {
  const res = await fetch(`${config.API_URL}/projects/contract-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de contrato');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de tipos de contrato');
  return response.data;
}

export async function fetchApplicationTypes() {
  const res = await fetch(`${config.API_URL}/projects/application-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de postulación');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de tipos de postulación');
  return response.data;
}


export async function createProject(formData) {

  let res;
  try {
    res = await fetch(`${config.API_URL}/projects/publish`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
  } catch (networkError) {
    console.error('❌ Error de red:', networkError);
    throw new Error(`Error de conexión: ${networkError.message}`);
  }

  // Obtener el texto completo de la respuesta
  let responseText;
  try {
    responseText = await res.text();
  } catch (textError) {
    throw new Error(`Error al leer respuesta del servidor (${res.status})`);
  }

  // Intentar parsear como JSON
  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Error del servidor: ${res.status} ${res.statusText}. Respuesta: ${responseText.substring(0, 200)}`);
  }

  if (!res.ok) {
    
    // Extraer mensaje más detallado del backend
    let errorMessage = 'Error al crear el proyecto';
    let errorDetails = '';
    
    if (json?.message) {
      errorMessage = json.message;
    } else if (json?.error) {
      errorMessage = json.error;
    } else if (json?.errors && Array.isArray(json.errors)) {
      errorDetails = json.errors.map(e => typeof e === 'string' ? e : e.message || JSON.stringify(e)).join(', ');
      errorMessage = errorDetails || 'Errores de validación del backend';
    } else if (json?.errors && typeof json.errors === 'object') {
      // Si errors es un objeto (validación de campos)
      errorDetails = Object.entries(json.errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      errorMessage = errorDetails || 'Error de validación';
    }
    
    const fullError = errorDetails ? `${errorMessage} - ${errorDetails}` : errorMessage;
    throw new Error(`${fullError} (${res.status})`);
  }

  return json;
}

// Función para eliminar un proyecto por ID
export async function deleteProjectById(projectId, motivo) {
  try {
    const res = await fetch(`${config.API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: motivo })
    });

    if (!res.ok) {
      let errorMessage = 'Error al eliminar el proyecto';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Verificar si hay contenido en la respuesta
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }

    // Si no hay contenido JSON, devolver un objeto de éxito
    return { success: true, message: 'Proyecto eliminado correctamente' };
  } catch (error) {
    throw error;
  }
}
