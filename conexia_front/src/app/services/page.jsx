'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { FaTools } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function ServicesPage() {
  const { roleName } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');

  const canCreateService = roleName === ROLES.USER;

  return (
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight">
                Servicios
              </h1>
              <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                Descubre y contrata servicios de la comunidad
              </p>
            </div>
            
            {canCreateService && (
              <Link href="/services/create">
                <Button variant="primary" className="flex items-center gap-2">
                  <FaTools size={16} />
                  Publicar servicio
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green/50"
                />
              </div>
            </div>
            
            <Button variant="informative" className="flex items-center gap-2 lg:w-auto">
              <Filter size={20} />
              Filtros
            </Button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-conexia-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-conexia-green" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Próximamente: Servicios de la Comunidad
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Esta funcionalidad está en desarrollo. Pronto podrás ver y contratar servicios de otros miembros de la comunidad.
              </p>
            </div>
            
            {canCreateService && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  ¡Mientras tanto, puedes ser de los primeros en publicar tu servicio!
                </p>
                <Link href="/services/create">
                  <Button variant="primary" className="inline-flex items-center gap-2">
                    <FaTools size={16} />
                    Publicar mi primer servicio
                  </Button>
                </Link>
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}