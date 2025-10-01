'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const hiringId = params?.hiringId;
  
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown para redirección automática
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/services/my-hirings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago se ha procesado correctamente. El servicio ha sido contratado 
            y el proveedor será notificado para comenzar el trabajo.
          </p>

          {/* Información adicional */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>¿Qué sigue?</strong>
              <br />
              • El proveedor iniciará el trabajo según lo acordado
              <br />
              • Recibirás actualizaciones del progreso
              <br />
              • Podrás comunicarte a través del sistema de mensajería
            </p>
          </div>

          {/* Contador de redirección */}
          <p className="text-sm text-gray-500 mb-6">
            Serás redirigido automáticamente en {countdown} segundos...
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="informative"
              onClick={() => router.push('/services/my-hirings')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Ver Mis Solicitudes
            </Button>
            <Button
              variant="cancel"
              onClick={() => router.push('/services')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver a Servicios
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}