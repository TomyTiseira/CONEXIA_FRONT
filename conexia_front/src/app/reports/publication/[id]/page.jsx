"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import PublicationReportsGrid from '@/components/admin/reports/PublicationReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PublicationReportsPage({ params }) {
  const { id } = React.use(params);
  
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando reportes" />}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <PublicationReportsGrid publicationId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
