'use client';

import React, { Suspense } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import CommentReportsContent from './CommentReportsContent';

export default function CommentReportsPage({ params: promiseParams }) {
  const params = React.use(promiseParams);
  const commentId = params?.commentId;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reportes del comentario...</div>}>
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} fallbackComponent={<NotFound />}>
        <Navbar />
        <CommentReportsContent commentId={commentId} />
      </ProtectedRoute>
    </Suspense>
  );
}
