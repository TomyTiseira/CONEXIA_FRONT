'use client';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import Navbar from "@/components/common/Navbar";
import { NavbarHome } from "@/components/NavbarHome";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

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
      <ProtectedRoute allowedRoles={['user']}>
        <div className="min-h-screen bg-[#f3f9f8]">
          <Navbar />
          <ClientCommunity />
        </div>
      </ProtectedRoute>
      
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Bienvenido, Admin</div> {/* insertar el componente de admin acá */}
      </ProtectedRoute>
      
      <ProtectedRoute allowedRoles={['moderador']}>
        <div>Bienvenido, Moderador</div> {/* insertar el componente de moderador acá */}
      </ProtectedRoute>
    </ProtectedRoute>
  );
}
