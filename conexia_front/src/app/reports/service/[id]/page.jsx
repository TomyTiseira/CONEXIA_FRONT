"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import ServiceReportsDetailGrid from '@/components/admin/reports/ServiceReportsDetailGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function ServiceReportsPage({ params }) {
  // Next.js: params is a Promise; unwrap with React.use() to access properties
  const { id } = React.use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes del servicio...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ServiceReportsDetailGrid serviceId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
