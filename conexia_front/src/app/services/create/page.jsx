'use client';

import { useRouter } from 'next/navigation';
import CreateServiceForm from '@/components/services/CreateServiceForm';
import ServicePermissionGuard from '@/components/services/ServicePermissionGuard';
import Navbar from '@/components/navbar/Navbar';
import { ArrowLeft } from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();

  return (
    <ServicePermissionGuard>
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        {/* Navbar fijo arriba */}
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="mb-8">
            <div className="w-full max-w-4xl mx-auto mb-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-conexia-green hover:text-conexia-green/80 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Volver
                </button>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight">
                  Publica tu servicio
                </h1>
                
                {/* Espaciador invisible para centrar el título */}
                <div className="w-20"></div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-conexia-green-dark text-base md:text-lg">
                Ofrece tus habilidades a la comunidad
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="max-w-4xl mx-auto">
            <CreateServiceForm />
            </div>
          </div>
        </main>
      </div>
    </ServicePermissionGuard>
  );
}