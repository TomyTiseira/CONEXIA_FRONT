import { Suspense } from "react";
import TimeoutClient from "@/components/auth/TimeoutClient";

export default function TimeoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
      <TimeoutClient />
    </Suspense>
  );
}
