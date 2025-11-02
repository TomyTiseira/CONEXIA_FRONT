import { Suspense } from "react";
import RegisterForm from "@/components/register/RegisterForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-conexia-green via-conexia-green/95 to-[#0d2d28] flex items-center justify-center p-4">
      <Suspense fallback={<LoadingSpinner message="Cargando formulario..." />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
