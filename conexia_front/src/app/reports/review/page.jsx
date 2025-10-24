"use client";

import Navbar from '@/components/navbar/Navbar';
import ReviewReportsList from '@/components/admin/reports/ReviewReportsList';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { Suspense } from 'react';

export default function ReviewReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes de reseñas...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <ReviewReportsList />
      </ProtectedRoute>
    </Suspense>
  );
}
