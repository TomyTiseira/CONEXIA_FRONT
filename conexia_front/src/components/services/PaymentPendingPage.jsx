'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentPendingPage() {
  const params = useParams();
  const router = useRouter();
  const hiringId = params?.hiringId;
  
  const [refreshCounter, setRefreshCounter] = useState(30);

  useEffect(() => {
    // Contador para refresh automático
    const timer = setInterval(() => {
      setRefreshCounter((prev) => {
        if (prev <= 1) {
          // Refrescar la página para verificar el estado del pago
          window.location.reload();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de pendiente */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4">
              <Clock size={64} className="text-yellow-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago en Proceso
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago está siendo procesado. Esto puede tomar unos minutos. 
            Te notificaremos cuando se complete la transacción.
          </p>

          {/* Información del proceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Estado actual:</strong> Esperando confirmación del procesador de pagos
              <br />
              <br />
              <strong>Tiempo estimado:</strong> 5-15 minutos
              <br />
              <br />
              <strong>¿Qué hacer?</strong> Mantén esta pestaña abierta o revisa tu email para actualizaciones
            </p>
          </div>

          {/* Contador de actualización */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <RefreshCw size={16} className="text-gray-500" />
            <p className="text-sm text-gray-500">
              Verificando estado en {refreshCounter} segundos...
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="informative"
              onClick={handleManualRefresh}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Verificar Ahora
            </Button>
            <Button
              variant="cancel"
              onClick={() => router.push('/services/my-hirings')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Ver Mis Solicitudes
            </Button>
          </div>

          {/* Botón secundario */}
          <div className="mt-4">
            <Button
              variant="cancel"
              onClick={() => router.push('/services')}
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver a Servicios
            </Button>
          </div>

          {/* Nota importante */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500">
              <strong>Importante:</strong> No cierres esta ventana hasta que se confirme el pago
            </p>
          </div>
        </div>
      </div>
    </>
  );
}