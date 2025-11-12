'use client';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DashboardSkeleton } from '@/components/dashboard/LoadingStates';
import Navbar from '@/components/navbar/Navbar';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Página principal del Dashboard
 * Renderiza el dashboard correspondiente según el rol del usuario
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirigir al login si no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loader mientras carga la autenticación
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton cards={4} />
        </div>
      </>
    );
  }

  // Si no hay usuario, no renderizar nada (se redirige en el useEffect)
  if (!user) {
    return null;
  }

  // Determinar el rol del usuario basado en roleId (más confiable que role string)
  // roleId: 1 = admin, 2 = user, 3 = moderador
  const roleId = user.roleId;
  const isAdmin = roleId === 1;
  const isModerator = roleId === 3;
  const isInternalUser = isAdmin || isModerator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Renderizar dashboard según rol */}
          {isInternalUser ? <AdminDashboard /> : <UserDashboard />}
        </div>
      </motion.div>
    </div>
  );
}
