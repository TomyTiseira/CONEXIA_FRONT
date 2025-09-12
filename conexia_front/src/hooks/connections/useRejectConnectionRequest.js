import { useState } from 'react';
import { cancelConnectionRequest } from '@/service/connections/cancelConnectionRequest';

export function useRejectConnectionRequest() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const rejectRequest = async (requestId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Utilizamos el mismo servicio que para cancelar, ya que el backend diferencia automáticamente
      // entre cancelación y rechazo según quién hace la solicitud
      const response = await cancelConnectionRequest(requestId);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'Error al rechazar solicitud');
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { rejectRequest, loading, success, error };
}
