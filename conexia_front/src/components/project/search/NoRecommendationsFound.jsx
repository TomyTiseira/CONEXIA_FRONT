'use client';
import { Search } from 'lucide-react';

export default function NoRecommendationsFound() {
  return (
    <div className="text-center py-12 px-6">
      <div className="max-w-md mx-auto">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-conexia-green mb-4">
          No encontramos proyectos que coincidan con tus habilidades
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          En este momento no hay proyectos disponibles que busquen exactamente tus habilidades. 
          Te sugerimos que uses los filtros de búsqueda para explorar otros proyectos interesantes.
        </p>

        {/* Texto adicional */}
        <p className="text-sm text-gray-500">
          Vuelve pronto, siempre estamos agregando nuevos proyectos.
        </p>
      </div>
    </div>
  );
}
