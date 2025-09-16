"use client";
import React, { Suspense } from "react";
import PublicationReportsGrid from '@/components/admin/reports/PublicationReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';

export default function PublicationReportsPage({ params }) {
  const { id } = React.use(params);
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
        <PublicationReportsGrid publicationId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
