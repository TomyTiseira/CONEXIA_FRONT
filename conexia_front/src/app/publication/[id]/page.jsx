"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import PublicationDetail from '@/components/activity/PublicationDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';

export default function PublicationDetailPage({ params, searchParams }) {
  const { id } = React.use(params);
  const resolvedSearchParams = React.use(searchParams);
  
  // Si viene desde reportes, solo permitir admin y moderador
  const fromReports = resolvedSearchParams?.from === 'reports-publication';
  const allowedRoles = fromReports 
    ? [ROLES.ADMIN, ROLES.MODERATOR] 
    : [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER];
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando publicación...</div>}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Navbar />
        <PublicationDetail publicationId={id} searchParams={resolvedSearchParams} />
      </ProtectedRoute>
    </Suspense>
  );
}
