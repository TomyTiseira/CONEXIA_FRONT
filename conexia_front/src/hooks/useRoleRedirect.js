// hooks/useRoleRedirect.js
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/service/auth/authService";
import { getRoleById } from "@/service/user/userFetch";

export default function useRoleRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      try {
        const user = await getProfile();
        if (!user || !user.roleId) {
          setLoading(false);
          return;
        }

        const roleName = await getRoleById(user.roleId);

        setTimeout(() => {
          if (roleName === "admin") router.replace("/admin");
          else if (roleName === "moderador") router.replace("/moderator");
          else router.replace("/community");
        }, 500); // pequeña pausa para mostrar el modal al menos un instante
      } catch (error) {
        console.error("Error al redireccionar:", error);
      } finally {
        setLoading(false);
      }
    };

    redirectIfLoggedIn();
  }, [router]);

  return { loading };
}
