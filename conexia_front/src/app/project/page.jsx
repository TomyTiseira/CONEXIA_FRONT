'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';

export default function ProjectMainPage() {
  const { roleName } = useUserStore();
  const router = useRouter();

  // Redirigir automáticamente a la página de búsqueda que ahora incluye recomendaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/project/search');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen w-full bg-conexia-soft overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green mb-8">Consultar proyectos</h1>
        
        {/* Mensaje de carga */}
        <div className="text-conexia-green/70 mb-6">
          Cargando recomendaciones...
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/project/search">
            <button className="bg-conexia-green text-white px-6 py-3 rounded-xl shadow-lg hover:bg-conexia-green-dark transition font-semibold text-lg">
              Ver proyectos recomendados
            </button>
          </Link>
          
          {roleName === ROLES.USER && (
            <Link href="/project/create">
              <button className="bg-white text-conexia-green border-2 border-conexia-green px-6 py-3 rounded-xl shadow-lg hover:bg-conexia-green hover:text-white transition font-semibold text-lg">
                Crea tu proyecto
              </button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
