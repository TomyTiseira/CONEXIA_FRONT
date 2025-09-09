import { useState } from 'react';
import { cancelConnectionRequest } from '@/service/connections/cancelConnectionRequest';

export function useCancelConnectionRequest() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const cancelRequest = async (requestId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await cancelConnectionRequest(requestId);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'Error al cancelar solicitud');
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cancelRequest, loading, success, error };
}
