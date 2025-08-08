
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchMyProjects } from '@/service/projects/projectsFetch';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import NavbarModerator from '@/components/navbar/NavbarModerator';
import ProjectList from './ProjectList';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

export default function MyProjectsView({ userId }) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // Determinar si el usuario autenticado es el dueño de los proyectos que se están viendo
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  useEffect(() => {
    if (!userId && !authUser) return;
    async function load() {
      setLoading(true);
      // Si showInactive es true, pasar false para incluir eliminados; si es false, pasar true para solo activos
      const res = await fetchMyProjects({ ownerId: userId , active: !showInactive});
      setProjects(res);
      setLoading(false);
      setPage(1); // Reiniciar a la primera página al buscar
    }
    load();
  }, [userId, authUser, showInactive]);

  // Renderizar la navbar apropiada según el rol
  const renderNavbar = () => {
    if (authUser?.role === ROLES.ADMIN) {
      return <NavbarAdmin />;
    } else if (authUser?.role === ROLES.MODERATOR) {
      return <NavbarModerator />;
    } else {
      return <NavbarCommunity />;
    }
  };

  return (
    <>
      {renderNavbar()}
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          {/* Título y opciones */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 w-full px-6 sm:px-0">
            <h1 className="text-3xl font-bold text-conexia-green bg-white rounded-lg px-6 py-3 shadow-sm text-center md:text-left whitespace-nowrap">
              {isOwner ? 'Mis Proyectos' : 'Proyectos del Usuario'}
            </h1>
            {isOwner && (
              <label className="flex items-center gap-2 mt-4 md:mt-0 text-conexia-green font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={e => setShowInactive(e.target.checked)}
                  className="accent-conexia-green"
                />
                Ver también proyectos inactivos
              </label>
            )}
          </div>
          <section className="flex-1 min-w-0">
            {loading ? (
              <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
            ) : (
              <>
                <ProjectList projects={projects.slice((page-1)*pageSize, page*pageSize)} />
                
                {/* Botón Atrás y Paginado */}
                <div className="mt-6">
                  {/* En móvil: botón atrás a la izquierda y paginado centrado en la misma línea */}
                  <div className="flex items-center md:hidden px-6 sm:px-0">
                    <button 
                      className="bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600 transition text-sm whitespace-nowrap h-[38px] flex items-center"
                      onClick={() => {
                        if (isOwner) {
                          // Si es el dueño, ir a su perfil
                          router.push(`/profile/userProfile/${userId}`);
                        } else {
                          // Si no es el dueño, ir hacia atrás
                          router.back();
                        }
                      }}
                    >
                      ← Atrás
                    </button>
                    
                    <div className="flex-1 flex justify-center items-center">
                      <div className="flex items-center -mt-6">
                        <Pagination
                          page={page}
                          hasPreviousPage={page > 1}
                          hasNextPage={projects.length > page * pageSize}
                          onPageChange={setPage}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* En desktop: botón atrás a la izquierda, paginado centrado */}
                  <div className="hidden md:flex md:items-center px-6 sm:px-0">
                    <button 
                      className="bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600 transition text-sm whitespace-nowrap h-[38px] flex items-center"
                      onClick={() => {
                        if (isOwner) {
                          // Si es el dueño, ir a su perfil
                          router.push(`/profile/userProfile/${userId}`);
                        } else {
                          // Si no es el dueño, ir hacia atrás
                          router.back();
                        }
                      }}
                    >
                      ← Atrás
                    </button>
                    
                    <div className="flex-1 flex justify-center items-center">
                      <div className="flex items-center -mt-6">
                        <Pagination
                          page={page}
                          hasPreviousPage={page > 1}
                          hasNextPage={projects.length > page * pageSize}
                          onPageChange={setPage}
                        />
                      </div>
                    </div>
                    
                    {/* Espaciador invisible para mantener el centrado */}
                    <div className="w-[72px] flex items-center"></div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
