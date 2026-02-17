'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowRight, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentPendingReturnPage() {
  const router = useRouter();

  const handleGoToHirings = () => {
    router.push('/services/my-hirings');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de pendiente */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4 animate-pulse">
              <Clock size={64} className="text-yellow-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago en proceso
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme la transacción.
          </p>

          {/* Información del proceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex gap-2 mb-2">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>¿Qué significa esto?</strong>
              </p>
            </div>
            <ul className="text-sm text-blue-800 space-y-2 ml-6">
              <li>• El pago puede tardar unos minutos en confirmarse</li>
              <li>• Recibirás un email cuando se procese</li>
              <li>• Podés revisar el estado en "Mis solicitudes"</li>
            </ul>
          </div>

          {/* Información adicional */}
          <p className="text-xs text-gray-500 mb-6">
            <strong>Tiempo estimado:</strong> 5 a 15 minutos
            <br />
            No cierres tu sesión mientras tanto
          </p>

          {/* Botón de acción */}
          <Button
            variant="informative"
            onClick={handleGoToHirings}
            className="w-full flex items-center justify-center gap-2"
          >
            Ver mis solicitudes
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </>
  );
}
