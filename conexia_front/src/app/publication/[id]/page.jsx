"use client";
import React, { Suspense } from "react";
import Navbar from '@/components/navbar/Navbar';
import PublicationDetail from '@/components/activity/PublicationDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function PublicationDetailPage({ params, searchParams }) {
  const { id } = React.use(params);
  const resolvedSearchParams = React.use(searchParams);
  
  // TODA la página de publicación es solo para ADMIN y MODERADOR
  const allowedRoles = [ROLES.ADMIN, ROLES.MODERATOR];
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando publicación...</div>}>
      <ProtectedRoute allowedRoles={allowedRoles} fallbackComponent={<NotFound />}>
        <Navbar />
        <PublicationDetail publicationId={id} searchParams={resolvedSearchParams} />
      </ProtectedRoute>
    </Suspense>
  );
}
