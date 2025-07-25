'use client';

import useSessionTimeout from '@/hooks/useSessionTimeout';

export default function ClientAdmin() {
  useSessionTimeout();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-conexia-green">Bienvenido Moderador</h1>
    </main>
  );
}
