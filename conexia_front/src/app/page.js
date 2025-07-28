'use client';
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import ClientAdmin from "@/components/admin/ClientAdmin";
import NavbarAdmin from "@/components/navbar/NavbarAdmin";
import NavbarHome from "@/components/navbar/NavbarHome";
import NavbarModerator from "@/components/navbar/NavbarModerator";
import ClientModerator from "@/components/moderator/ClientModerator";
import HeroHome from "@/components/hero/HeroHome";
import { Footer } from "@/components/Footer";
import { ROLES } from "@/constants/roles";

export default function Home() {
  // Contenido público para usuarios no autenticados
  const publicContent = (
    <>
      <NavbarHome />
      <HeroHome />
      <Footer />
    </>
  );

  // Contenido específico para cada rol
  const roleBasedContent = {
    [ROLES.USER]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <NavbarCommunity />
        <ClientCommunity />
      </div>
    ),
    [ROLES.ADMIN]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <NavbarAdmin />
        <ClientAdmin />
      </div>
    ),
    [ROLES.MODERATOR]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <NavbarModerator />
        <ClientModerator />
      </div>
    )
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-conexia-green">Cargando...</p>
        </div>
      </div>
    }>
      <ProtectedRoute 
        publicContent={publicContent}
        roleBasedContent={roleBasedContent}
      >
      </ProtectedRoute>
    </Suspense>
  );
}
