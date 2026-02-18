import { Suspense } from "react";
import TimeoutClient from "@/components/auth/TimeoutClient";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TimeoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando" />}>
      <TimeoutClient />
    </Suspense>
  );
}
