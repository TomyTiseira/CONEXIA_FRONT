'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function MercadoPagoTestComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Ejemplo de test con un hiring ID ficticio
      const hiringId = 1; // Cambia por un ID real
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service-hirings/${hiringId}/contract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentMethod: 'credit_card' // o 'debit_card', 'bank_transfer'
          })
        }
      );

      const result = await response.json();

      if (result.success && result.data?.mercadoPagoUrl) {
        setResult(result);
        // Comentar la siguiente línea para testing sin redirección
        // window.location.href = result.data.mercadoPagoUrl;
      } else {
        setError('No se recibió URL de pago válida');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Test MercadoPago Integration</h3>
      
      <Button 
        onClick={testPayment} 
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? 'Procesando...' : 'Test Payment'}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          <strong>Success!</strong>
          <br />
          Payment ID: {result.data?.paymentId}
          <br />
          Preference ID: {result.data?.preferenceId}
          <br />
          URL: {result.data?.mercadoPagoUrl}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Variables de entorno:</strong></p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>MP Public Key: {process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 20)}...</p>
      </div>
    </div>
  );
}