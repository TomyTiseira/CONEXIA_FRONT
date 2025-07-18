'use client';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import Navbar from "@/components/common/Navbar";
import { NavbarHome } from "@/components/NavbarHome";
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

  return (
    <ProtectedRoute publicContent={publicContent}>
      <ProtectedRoute allowedRoles={[ROLES.USER]}>
        <div className="min-h-screen bg-[#f3f9f8]">
          <Navbar />
          <ClientCommunity />
        </div>
      </ProtectedRoute>
      
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <div>Bienvenido, Admin</div> {/* insertar el componente de admin acá */}
      </ProtectedRoute>
      
      <ProtectedRoute allowedRoles={[ROLES.MODERATOR]}>
        <div>Bienvenido, Moderador</div> {/* insertar el componente de moderador acá */}
      </ProtectedRoute>
    </ProtectedRoute>
  );
}
