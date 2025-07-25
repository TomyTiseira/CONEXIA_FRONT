'use client';

import { useState } from 'react';
import InternalUsersTable from '@/components/admin/internal-users/InternalUsersTable';
import InternalUsersFilters from '@/components/admin/internal-users/InternalUsersFilters';
import useInternalUsers from '@/hooks/internal-users/useInternalUsers';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import CreateInternalUserModal from '@/components/admin/internal-users/CreateInternalUserModal';
import useDeleteInternalUser from '@/hooks/internal-users/useDeleteInternalUser';
import DeleteInternalUserModal from '@/components/admin/internal-users/DeleteInternalUserModal';
import EditInternalUserModal from '@/components/admin/internal-users/EditInternalUserModal';

export default function InternalUsersPage() {
  const internalUsers = useInternalUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const { handleDelete, deletingId } = useDeleteInternalUser();

  return (
    <>
      <NavbarAdmin />

      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative">
          <h1 className="text-2xl font-bold text-conexia-green text-center">
            Usuarios internos
          </h1>

          <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2">
            <Button
              variant="add"
              className="flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Agregar usuario interno
            </Button>
          </div>

          <div className="sm:hidden mt-4 flex justify-center">
            <Button
              variant="add"
              className="flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Agregar usuario interno
            </Button>
          </div>
        </div>

        <InternalUsersFilters {...internalUsers} />
        <InternalUsersTable
          {...internalUsers}
          onDeleteUser={(user) => setUserToDelete(user)}
          onEditUser={(user) => setUserToEdit(user)}
        />
      </main>

      {isModalOpen && (
        <CreateInternalUserModal
          onClose={() => setIsModalOpen(false)}
          onUserCreated={internalUsers.refetch}
        />
      )}

      {userToDelete && (
        <DeleteInternalUserModal
          email={userToDelete.email}
          loading={deletingId === userToDelete.id}
          onConfirm={() => handleDelete(userToDelete.id)}
          onCancel={() => setUserToDelete(null)}
          onUserDeleted={internalUsers.refetch}
        />
      )}

      {userToEdit && (
        <EditInternalUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onUserUpdated={internalUsers.refetch}
        />
      )}
    </>
  );
}
