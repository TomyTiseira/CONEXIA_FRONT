'use client';
import { NavbarHome } from "@/components/NavbarHome";
import ClientCommunity from "@/components/community/ClientCommunity";
import Navbar from "@/components/common/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks";

export default function Home() {
  const { isAuthenticated, isLoading, error, user } = useAuth();
  console.log(isAuthenticated, isLoading, error, user);

  const roleId = user?.roleId ?? null;
  const { role, loading: loadingRole, error: roleError } = useRole(roleId);
  
  // TODO: Manejar el estado de carga y error
  if (isLoading) {
    return <div>Loading...</div>; // Se podría hacer un spinner o algo más elegante
  }

  if (!isAuthenticated || error) {
    return (
      <>
        <NavbarHome />
        <Hero />
        <Footer />
      </>
    );
  }

  // TODO: Manejar el estado de carga y error
  if (loadingRole) return <div>Cargando rol...</div>; // Mismo caso que el otro login, reutilizar el componente de carga
  if (roleError) return <div>Error al obtener el rol</div>; // Eso saldría solo cuando el rol no es válido, podría redirigir al login

  if (role === 'admin') {
    return <div>Bienvenido, Admin</div>; // insertar el componente de admin acá
  }

  if (role === 'user') {
    return (
        <div className="min-h-screen bg-[#f3f9f8]">
          <Navbar />
          <ClientCommunity />
        </div>
      );
  }

  if (role === 'moderador') {
    return <div>Bienvenido, Moderador</div>; // insertar el componente de moderador acá
  }

}
