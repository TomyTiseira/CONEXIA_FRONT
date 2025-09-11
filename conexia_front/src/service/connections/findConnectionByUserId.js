'use client';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';
import { config } from '@/config';

/**
 * Busca una conexión específica por userId
 * @param {string} userId - ID del usuario con el que se quiere verificar la conexión
 * @returns {Promise<Object>} - Datos de la conexión si existe
 */
export async function findConnectionByUserId(userId) {
  try {
    // Primero intentamos obtener todas las solicitudes del usuario
    const response = await fetchWithRefresh(`${config.API_URL}/contacts/requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar conexión');
    }

    const data = await response.json();
    
    // Buscar la conexión específica en las solicitudes recibidas y enviadas
    const allRequests = [
      ...(data.receivedRequests || []),
      ...(data.sentRequests || [])
    ];
    
    // Buscar una conexión que involucre al usuario específico
    const connection = allRequests.find(request => 
      (request.senderId === parseInt(userId) || request.receiverId === parseInt(userId))
    );
    
    return { data: connection || null };
  } catch (error) {
    // Si hay un error, retornamos null en lugar de lanzar el error para no romper la UI
    console.error('Error al buscar conexión:', error);
    return { data: null };
  }
}
