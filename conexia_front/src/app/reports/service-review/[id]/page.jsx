'use client';

import { use } from 'react';
import ServiceReviewReportsGrid from '@/components/admin/reports/ServiceReviewReportsGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';

export default function ServiceReviewReportDetailPage({ params }) {
  const { id } = use(params);

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
      <ServiceReviewReportsGrid serviceReviewId={id} />
    </ProtectedRoute>
  );
}
