'use client';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientCommunity from "@/components/community/ClientCommunity";
import Navbar from "@/components/common/Navbar";

export default function Home() {
  return (
    <ProtectedRoute>
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
