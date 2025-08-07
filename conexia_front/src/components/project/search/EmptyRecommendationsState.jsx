'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Star } from 'lucide-react';

export default function EmptyRecommendationsState() {
  const router = useRouter();
  const { user } = useAuth();

  const handleCompleteProfile = () => {
    // Redirigir a la visualización del perfil del usuario actual
    if (user?.id) {
      router.push(`/profile/userProfile/${user.id}`);
    } else {
      // Fallback en caso de que no haya user.id
      router.push('/profile/Create');
    }
  };

  return (
    <div className="text-center py-12 px-6">
      <div className="max-w-md mx-auto">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-conexia-green/10 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-conexia-green" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-conexia-green mb-4">
          ¡Descubre proyectos perfectos para ti!
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Completa tu perfil agregando tus habilidades y te mostraremos proyectos 
          que buscan exactamente lo que sabes hacer.
        </p>

        {/* Botón de acción */}
        <button
          onClick={handleCompleteProfile}
          className="bg-conexia-green text-white px-6 py-3 rounded-xl shadow-lg hover:bg-conexia-green-dark transition font-semibold text-lg"
        >
          Completar perfil
        </button>

        {/* Texto adicional */}
        <p className="text-sm text-gray-500 mt-4">
          Agrega tus habilidades desde tu perfil para recibir recomendaciones personalizadas.
        </p>
      </div>
    </div>
  );
}
