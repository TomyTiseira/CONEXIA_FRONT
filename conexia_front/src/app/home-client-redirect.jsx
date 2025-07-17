// app/(home)/HomeClientRedirect.jsx
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/service/auth/authService";
import { getRoleById } from "@/service/user/userFetch";

export default function HomeClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      try {
        const user = await getProfile(); // /auth/me
        const roleId = user?.roleId;
        console.log(user);

        if (!user) return;

        const role = await getRoleById(roleId); // obtenemos el nombre del rol

        if (role === "admin") return router.replace("/admin");
        if (role === "moderator") return router.replace("/moderator");
        return router.replace("/community"); // usuario común
      } catch (err) {
        // No logueado → no redirige
      }
    };

    redirectIfLoggedIn();
  }, [router]);

  return null;
}
