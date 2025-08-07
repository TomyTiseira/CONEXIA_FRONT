import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CompactNoRecommendations() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCompleteProfile = () => {
    if (user?.id) {
      router.push(`/profile/userProfile/${user.id}`);
    }
  };

  return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            ¡Encontra los proyectos adecuados!
          </h3>
          <p className="text-sm text-gray-600">
            Completa tu perfil con tus habilidades para recibir recomendaciones.
          </p>
        </div>        <button
          onClick={handleCompleteProfile}
          className="bg-conexia-green text-white px-4 py-2 rounded-lg shadow hover:bg-conexia-green-dark transition font-medium text-sm whitespace-nowrap"
        >
          Completar perfil
        </button>
      </div>
    </div>
  );
}
