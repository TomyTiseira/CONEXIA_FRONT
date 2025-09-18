"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import PublicationReportsGrid from '@/components/admin/reports/PublicationReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function PublicationReportsPage({ params }) {
  const { id } = React.use(params);
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <PublicationReportsGrid publicationId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
