'use client';

import React, { Suspense } from 'react';
import ServiceReviewReportsGrid from '@/components/admin/reports/ServiceReviewReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import Navbar from '@/components/navbar/Navbar';
import { NotFound } from '@/components/ui';

export default function ServiceReviewReportDetailPage({ params }) {
  const { id } = React.use(params);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes de la reseña de servicio...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ServiceReviewReportsGrid serviceReviewId={id} />
      </ProtectedRoute>
    </Suspense>
  );
}
