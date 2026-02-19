"use client";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import ServiceReportsDetailGrid from '@/components/admin/reports/ServiceReportsDetailGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function ServiceReportsPage({ params }) {
  // Next.js: params is a Promise; unwrap with React.use() to access properties
  const { id } = React.use(params);
  // Detectar si está en proceso de logout
  let isLoggingOut = false;
  if (typeof window !== 'undefined') {
    isLoggingOut = window.__CONEXIA_LOGGING_OUT__ === true;
  }
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando reportes del servicio..." fullScreen={true} />}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={isLoggingOut ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}>
        <Navbar />
        <ServiceReportsDetailGrid serviceId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
