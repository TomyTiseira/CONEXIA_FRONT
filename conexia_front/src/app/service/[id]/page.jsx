"use client";
import React from 'react';
import ServiceDetail from '@/components/services/ServiceDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function ServiceDetailPage({ params, searchParams }) {
  const { id } = React.use(params);
  const resolvedSearchParams = React.use(searchParams);
  const from = resolvedSearchParams?.from || '';
  const isFromReports =
    from === 'reports' ||
    from === 'reports-service' ||
    from === 'reports-service-review' ||
    resolvedSearchParams?.fromReportsServiceId ||
    resolvedSearchParams?.fromReportsServiceReviewId;
  const allowedRoles = isFromReports
    ? [ROLES.ADMIN, ROLES.MODERATOR]
    : [ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR];
  return (
    <ProtectedRoute allowedRoles={allowedRoles} fallbackComponent={<NotFound />}>
      <ServiceDetail serviceId={id} />
    </ProtectedRoute>
  );
}
