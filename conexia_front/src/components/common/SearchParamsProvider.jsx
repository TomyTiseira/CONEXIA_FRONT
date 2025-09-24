"use client";
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui';

// Componente que maneja los parámetros de búsqueda
function SearchParamsHandler({ children }) {
  return children;
}

// Wrapper con Suspense para componentes que usan useSearchParams
export function SearchParamsProvider({ children, fallback = <LoadingSpinner /> }) {
  return (
    <Suspense fallback={fallback}>
      <SearchParamsHandler>
        {children}
      </SearchParamsHandler>
    </Suspense>
  );
}