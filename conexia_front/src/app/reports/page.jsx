"use client";

import Navbar from '@/components/navbar/Navbar';
import ReportsList from '@/components/admin/reports/ReportsList';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ReportsPage() {
	return (
		<Suspense fallback={<LoadingSpinner message="Cargando reportes" />}>
			<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
				<Navbar />
				<ReportsList />
			</ProtectedRoute>
		</Suspense>
	);
}
