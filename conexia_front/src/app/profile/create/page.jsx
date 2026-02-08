'use client';

import CreateProfileForm from "@/components/profile/createProfile/createProfileForm";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NotFound } from "@/components/ui/NotFound";
import { useOnboardingStatus } from "@/hooks";

export default function CreateProfilePage() {
  const { isAllowed, isChecking } = useOnboardingStatus();

  // Mostrar loading mientras verifica el onboarding_token
  if (isChecking) {
    return <LoadingSpinner message="Verificando acceso..." />;
  }

  // Si no tiene onboarding_token válido, mostrar NotFound
  if (!isAllowed) {
    return (
      <NotFound 
        title="Página no encontrada"
        message="La página que buscas no existe o no tienes permisos para acceder a ella."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // Usuario tiene onboarding_token válido
  return (
    <main className="min-h-screen bg-gradient-to-br from-conexia-green via-conexia-green/95 to-[#0d2d28] flex items-center justify-center p-4">
      <Suspense fallback={<LoadingSpinner message="Cargando formulario..." />}>
        <CreateProfileForm />
      </Suspense>
    </main>
  );
}
