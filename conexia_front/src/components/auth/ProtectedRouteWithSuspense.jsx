"use client";
import { Suspense } from 'react';
import { ProtectedRoute as BaseProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '@/components/ui';

// Wrapper que envuelve ProtectedRoute con Suspense
function ProtectedRouteContent(props) {
  return <BaseProtectedRoute {...props} />;
}

export function ProtectedRoute(props) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRouteContent {...props} />
    </Suspense>
  );
}