import { useRoleValidation } from "@/hooks";

export const RoleBasedComponent = () => {
  const { 
    isAuthenticated, 
    role, 
    hasRole, 
    hasAnyRole,
    isInitialLoading 
  } = useRoleValidation();

  if (isInitialLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión para ver este contenido</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Contenido basado en roles</h2>
      
      {/* Contenido específico para admin */}
      {hasRole('admin') && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <h3 className="font-semibold text-red-800">Panel de Administración</h3>
          <p className="text-red-700">Solo los administradores pueden ver esto</p>
        </div>
      )}

      {/* Contenido para admin y moderador */}
      {hasAnyRole(['admin', 'moderador']) && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h3 className="font-semibold text-yellow-800">Panel de moderación</h3>
          <p className="text-yellow-700">Solo administradores y moderadores pueden ver esto</p>
        </div>
      )}

      {/* Contenido para todos los usuarios autenticados */}
      <div className="bg-green-100 p-4 rounded">
        <h3 className="font-semibold text-green-800">Contenido General</h3>
        <p className="text-green-700">Todos los usuarios autenticados pueden ver esto</p>
        <p className="text-sm text-gray-600">Tu rol actual es: {role}</p>
      </div>
    </div>
  );
}; 