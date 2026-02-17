'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentFailureReturnPage() {
  const router = useRouter();

  const handleGoToHirings = () => {
    router.push('/services/my-hirings');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle size={64} className="text-red-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago no completado
          </h1>
          
          <p className="text-gray-600 mb-6">
            No pudimos procesar tu pago. El servicio no ha sido aprobado y no se realizó ningún cargo.
          </p>

          {/* Posibles causas */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex gap-2 mb-2">
              <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Posibles causas:</strong>
              </p>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1 ml-6">
              <li>• Fondos insuficientes</li>
              <li>• Datos de pago incorrectos</li>
              <li>• Transacción cancelada</li>
              <li>• Problemas temporales del procesador</li>
            </ul>
          </div>

          {/* Recomendación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>¿Qué podés hacer?</strong>
              <br />
              Revisá los datos de tu medio de pago e intentá nuevamente desde "Mis solicitudes".
            </p>
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
