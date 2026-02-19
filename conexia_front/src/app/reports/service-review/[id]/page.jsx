'use client';

import React, { Suspense } from 'react';
import ServiceReviewReportsGrid from '@/components/admin/reports/ServiceReviewReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import Navbar from '@/components/navbar/Navbar';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ServiceReviewReportDetailPage({ params }) {
  const { id } = React.use(params);

  return (
    <Suspense fallback={<LoadingSpinner message="Cargando reportes de la reseña" />}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ServiceReviewReportsGrid serviceReviewId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
