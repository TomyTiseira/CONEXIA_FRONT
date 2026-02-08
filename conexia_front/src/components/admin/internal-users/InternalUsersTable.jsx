'use client';

import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import { ROLES_NAME } from '@/constants/roles';

export default function InternalUsersTable({
  users = [],
  hasNextPage,
  hasPreviousPage,
  filters,
  setFilters,
  loading,
  onDeleteUser,
  onEditUser,
}) {
  const showEmptyMessage = !loading && users.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 overflow-x-auto">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2 w-[300px] max-w-[300px]">Email</th>
            <th className="p-2 w-[150px] text-center">Rol</th>
            <th className="p-2 w-[180px] text-center">Fecha de Alta</th>
            <th className="p-2 w-[80px] text-center">Activo</th>
            <th className="p-2 w-[160px] text-center">Acciones</th>
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
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50 h-[52px]" // altura fija de la fila
              >
                <td className="p-2 truncate max-w-[300px]">{user.email}</td>
                <td className="p-2 w-[150px] text-center">{ROLES_NAME[user.role] || user.role}</td>
                <td className="p-2 w-[180px] text-center">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 text-center">{user.isActive ? 'SI' : 'NO'}</td>
                <td className="p-2 text-center align-middle">
                  {user.isActive ? (
                    <div className="flex justify-center gap-x-2">
                      <Button
                        variant="edit"
                        className="px-3 py-1 text-xs"
                        onClick={() => onEditUser(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="delete"
                        className="px-3 py-1 text-xs"
                        onClick={() => onDeleteUser(user)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center h-full items-center">
                      <span className="text-gray-400 text-xs italic">Inactivo</span>
                    </div>
                  )}
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
