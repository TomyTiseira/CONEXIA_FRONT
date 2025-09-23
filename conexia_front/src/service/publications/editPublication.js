import { config } from '@/config';
import { fetchWithRefresh } from '@/service';

export async function editPublication(id, formData) {
  const response = await fetchWithRefresh(`${config.API_URL}/publications/${id}`, {
    method: 'PATCH',
    body: formData,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Error al editar publicación');
  }
  return response.json();
}

// Nueva función para edición con múltiples archivos
export async function editPublicationWithMedia({ 
  id, 
  description, 
  files = [], 
  removeMediaIds = [], 
  removeAllMedia = false, 
  privacy 
}) {
  const formData = new FormData();
  
  if (description !== undefined) {
    formData.append('description', description);
  }
  
  // Agregar nuevos archivos
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('media', file);
    });
  }
  
  // IDs de archivos a eliminar
  if (removeMediaIds && removeMediaIds.length > 0) {
    formData.append('removeMediaIds', JSON.stringify(removeMediaIds));
  }
  
  // Eliminar todos los archivos
  if (removeAllMedia) {
    formData.append('removeMedia', 'true');
  }
  
  if (privacy) {
    formData.append('privacy', privacy);
  }
  
  const response = await fetchWithRefresh(`${config.API_URL}/publications/${id}`, {
    method: 'PATCH',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Error al editar publicación');
  }
  
  return response.json();
}
