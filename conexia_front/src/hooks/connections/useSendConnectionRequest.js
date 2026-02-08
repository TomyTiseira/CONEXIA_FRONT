import { useState } from 'react';
import { sendConnectionRequest } from '@/service/connections/sendConnectionRequest';

export function useSendConnectionRequest() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async (receiverId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await sendConnectionRequest(receiverId);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'Error al enviar solicitud');
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, success, error };
}
