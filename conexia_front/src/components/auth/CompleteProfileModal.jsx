"use client";

import { useRouter } from "next/navigation";
import { UserCircle, Briefcase, Users, CheckCircle } from "lucide-react";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function CompleteProfileModal() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/profile/create");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        {/* Card principal con estilo CONEXIA */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Logo y header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <ConexiaLogo width={100} height={40} />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-conexia-green/10 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-conexia-green" />
            </div>
            <h2 className="text-3xl font-bold text-conexia-green mb-2">
              ¡Un paso más!
            </h2>
            <p className="text-sm text-gray-600">
              Completa tu perfil profesional para comenzar
            </p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <p className="text-center text-gray-700 leading-relaxed">
              Para aprovechar todas las funcionalidades de <span className="font-semibold text-conexia-green">CONEXIA</span>,
              necesitamos algunos datos básicos para crear tu perfil profesional.
            </p>
          </div>

          {/* Lista de beneficios con iconos */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-conexia-green/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-conexia-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Accede a proyectos</p>
                <p className="text-xs text-gray-600">Participa en proyectos colaborativos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-conexia-green/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-conexia-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Conecta con profesionales</p>
                <p className="text-xs text-gray-600">Amplía tu red de contactos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-conexia-green/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-conexia-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Publica servicios</p>
                <p className="text-xs text-gray-600">Ofrece y contrata servicios profesionales</p>
              </div>
            </div>
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleComplete}
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Completar mi perfil
          </button>

          {/* Nota informativa */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-center text-blue-800">
              <span className="font-semibold">Nota:</span> Este paso es necesario para continuar usando la plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
