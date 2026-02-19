"use client";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import Navbar from '@/components/navbar/Navbar';
import ReviewReportsList from '@/components/admin/reports/ReviewReportsList';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { Suspense } from 'react';

export default function ReviewReportsPage() {
  // Detectar si está en proceso de logout
  let isLoggingOut = false;
  if (typeof window !== 'undefined') {
    isLoggingOut = window.__CONEXIA_LOGGING_OUT__ === true;
  }
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando reportes de reseñas..." fullScreen={true} />}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={isLoggingOut ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}>
        <Navbar />
        <ReviewReportsList />
      </ProtectedRoute>
    </Suspense>
  );
}
