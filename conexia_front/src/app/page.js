'use client';
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import ClientAdmin from "@/components/admin/ClientAdmin";
import NavbarHome from "@/components/navbar/NavbarHome";
import ClientModerator from "@/components/moderator/ClientModerator";
import HeroHome from "@/components/hero/HeroHome";
import { Footer } from "@/components/Footer";
import { ROLES } from "@/constants/roles";
import Navbar from "@/components/navbar/Navbar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Home() {
  // Contenido público para usuarios no autenticados
  const publicContent = (
    <div className="min-h-screen flex flex-col">
      <NavbarHome />
      <HeroHome />
      <Footer />
    </div>
  );

  // Contenido específico para cada rol
  const roleBasedContent = {
    [ROLES.USER]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <ClientCommunity />
      </div>
    ),
    [ROLES.ADMIN]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <ClientAdmin />
      </div>
    ),
    [ROLES.MODERATOR]: (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <ClientModerator />
      </div>
    )
  };

  return (
    <Suspense fallback={<LoadingSpinner message="Cargando CONEXIA" size="large" />}>
      <ProtectedRoute 
        publicContent={publicContent}
        roleBasedContent={roleBasedContent}
      >
      </ProtectedRoute>
    </Suspense>
  );
}
