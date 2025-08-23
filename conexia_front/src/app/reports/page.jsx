"use client";

import Navbar from '@/components/navbar/Navbar';
import ReportsList from '@/components/admin/reports/ReportsList';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { Suspense } from 'react';

export default function ReportsPage() {
	return (
		<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
			<Navbar />
			<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes...</div>}>
				<ReportsList />
			</Suspense>
		</ProtectedRoute>
	);
}
