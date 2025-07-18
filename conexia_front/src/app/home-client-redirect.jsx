'use client';

import useRoleRedirect from "@/hooks/useRoleRedirect";
import LoadingModal from "@/components/ui/LoadingModal";

export default function HomeClientRedirect() {
    const { loading } = useRoleRedirect();

    // Bloquea toda la pantalla y muestra solo el modal
    if (loading) {
      return <LoadingModal message="Redirigiendo a tu espacio..." />;
    }

    // No se muestra nada si ya redirigió
    return null;
  }
