'use client';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import ClientAdmin from "@/components/admin/ClientAdmin";
import NavbarAdmin from "@/components/navbar/NavbarAdmin";
import NavbarHome from "@/components/navbar/NavbarHome";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { ROLES } from "@/constants/roles";

export default function Home() {
  // Contenido público para usuarios no autenticados
  const publicContent = (
    <>
      <NavbarHome />
      <Hero />
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
      <div className="min-h-screen bg-[#f3f9f8] p-8">
        <h1 className="text-3xl font-bold text-conexia-green mb-6">Panel de Moderación</h1>
        <p className="text-conexia-green/70">Bienvenido al panel de moderación</p>
        {/* Aquí irían los componentes específicos del moderador */}
      </div>
    )
  };

  return (
    <ProtectedRoute 
      publicContent={publicContent}
      roleBasedContent={roleBasedContent}
    >
    </ProtectedRoute>
  );
}
