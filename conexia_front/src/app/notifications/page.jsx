'use client';

import Navbar from '@/components/navbar/Navbar';

export default function NotificationsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-conexia-green mb-4">Notificaciones</h1>
        <p className="text-conexia-green/70">Próximamente verás tus notificaciones aquí.</p>
      </div>
    </>
  );
}
