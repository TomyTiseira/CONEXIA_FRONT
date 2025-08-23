
"use client";
import React from "react";
import Navbar from '@/components/navbar/Navbar';
import ProjectReportsGrid from '@/components/admin/reports/ProjectReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function ProjectReportsPage({ params }) {
  const { id } = React.use(params);
  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
      <Navbar />
      <ProjectReportsGrid projectId={id} />
    </ProtectedRoute>
  );
}
