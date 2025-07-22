'use client';

import InternalUsersTable from '@/components/admin/internal-users/InternalUsersTable';
import InternalUsersFilters from '@/components/admin/internal-users/InternalUsersFilters';
import useInternalUsers from '@/hooks/useInternalUsers';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function InternalUsersPage() {
  const internalUsers = useInternalUsers(); // Hook centralizado

  return (
    <>
      <NavbarAdmin />

      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative">
          {/* Título centrado */}
          <h1 className="text-2xl font-bold text-conexia-green text-center">
            Usuarios internos
          </h1>

          {/* Botón en desktop: flotante a la derecha */}
          <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
            <Button variant="add" className="flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" />
              Agregar usuario interno
            </Button>
          </div>

          {/* Botón en mobile: abajo y centrado */}
          <div className="sm:hidden mt-4 flex justify-center">
            <Button variant="add" className="flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" />
              Agregar usuario interno
            </Button>
          </div>
        </div>

        <InternalUsersFilters {...internalUsers} />
        <InternalUsersTable {...internalUsers} />
      </main>
    </>
  );
}
