import VerifyForm from "@/components/verify-account/VerifyForm";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function VerifyAccountPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-conexia-green via-conexia-green/95 to-[#0d2d28] flex items-center justify-center p-4">
      <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
        <VerifyForm />
      </Suspense>
    </main>
  );
}