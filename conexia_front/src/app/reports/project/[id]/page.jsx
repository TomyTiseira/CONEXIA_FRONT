
"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import ProjectReportsGrid from '@/components/admin/reports/ProjectReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProjectReportsPage({ params }) {
  const { id } = React.use(params);
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando reportes del proyecto" />}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ProjectReportsGrid projectId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
