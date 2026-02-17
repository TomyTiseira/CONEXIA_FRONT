'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentSuccessReturnPage() {
  const router = useRouter();

  const handleGoToHirings = () => {
    router.push('/services/my-hirings');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4 animate-[scale-in_0.3s_ease-out]">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago acreditado!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago se procesó correctamente. El servicio ha sido aprobado exitosamente.
          </p>

          {/* Información adicional */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-green-800">
              <strong>¿Qué sigue?</strong>
            </p>
            <ul className="text-sm text-green-800 space-y-2 mt-2">
              <li>✓ El proveedor fue notificado de tu aprobación</li>
              <li>✓ Podés ver los detalles en "Mis solicitudes"</li>
              <li>✓ Recibirás actualizaciones por email y notificaciones</li>
            </ul>
          </div>

          {/* Botón de acción */}
          <Button
            variant="action"
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
