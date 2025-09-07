import { useState } from 'react';
import { acceptConnectionRequest } from '@/service/connections/acceptConnectionRequest';

export function useAcceptConnectionRequest() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const acceptRequest = async (requestId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await acceptConnectionRequest(requestId);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'Error al aceptar solicitud');
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { acceptRequest, loading, success, error };
}
