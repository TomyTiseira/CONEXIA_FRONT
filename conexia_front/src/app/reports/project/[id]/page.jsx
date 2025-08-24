
"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import ProjectReportsGrid from '@/components/admin/reports/ProjectReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function ProjectReportsPage({ params }) {
  const { id } = React.use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes del proyecto...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ProjectReportsGrid projectId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
