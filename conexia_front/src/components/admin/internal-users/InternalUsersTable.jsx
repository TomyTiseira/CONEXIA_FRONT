'use client';

import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';

const roleLabels = {
  admin: 'Administrador',
  moderador: 'Moderador',
};

export default function InternalUsersTable({
    users = [],
    hasNextPage,
    hasPreviousPage,
    filters,
    setFilters,
    loading,
  }) {
    const showEmptyMessage = !loading && users.length === 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 overflow-x-auto">
        <table className="min-w-[600px] w-full table-auto text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Email</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Fecha de Alta</th>
              <th className="p-2">Activo</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-conexia-green">
                  Cargando usuarios...
                </td>
              </tr>
            ) : showEmptyMessage ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 italic">
                  No se encontraron usuarios con los filtros aplicados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{roleLabels[user.role] || user.role}</td>
                  <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">{user.isActive ? 'SI' : 'NO'}</td>
                  <td className="p-2 text-center space-x-2">
                    <Button variant="edit" className="px-3 py-1 text-xs">
                      Editar
                    </Button>
                    <Button variant="delete" className="px-3 py-1 text-xs">
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && users.length > 0 && (
          <Pagination
            page={filters.page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          />
        )}
      </div>
    );
  }
