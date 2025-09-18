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
import BackButton from '@/components/ui/BackButton';
import MessagingWidget from '@/components/messaging/MessagingWidget';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';

export default function MyProjectsView({ userId }) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 12, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Determinar si el usuario autenticado es el dueño de los proyectos que se están viendo
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  useEffect(() => {
    if (!userId && !authUser) return;
    async function load() {
      setLoading(true);
      const res = await fetchMyProjects({ ownerId: userId, active: !showInactive, page, limit: pageSize });
      setProjects(res.projects);
      setPagination(res.pagination);
      setLoading(false);
    }
    load();
  }, [userId, authUser, showInactive, page]);

  // Reiniciar a la primera página al cambiar filtros
  useEffect(() => {
    setPage(1);
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

  // Avatar del usuario (como en ClientCommunity)
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';

  return (
    <>
      {renderNavbar()}
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-2 md:px-40 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          {/* Título y opciones */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 w-full px-2 md:px-0">
            <div className="w-full flex justify-center md:justify-start">
              <div className="w-full md:w-[480px] flex justify-center md:justify-start">
                <h1
                  className="font-bold text-conexia-green bg-white rounded-lg px-6 py-3 shadow-sm text-center md:text-left whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(1.15rem, 2.7vw, 1.7rem)',
                    lineHeight: 1.2,
                    minWidth: '120px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    display: 'block',
                  }}
                  title={isOwner ? 'Mis Proyectos Colaborativos' : 'Proyectos Colaborativos'}
                >
                  {isOwner ? 'Mis Proyectos Colaborativos' : 'Proyectos Colaborativos'}
                </h1>
              </div>
            </div>
            {isOwner && (
              <div className="w-full flex justify-center md:justify-end">
                <label className="flex items-center gap-2 mt-4 md:mt-0 text-conexia-green font-medium cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={e => setShowInactive(e.target.checked)}
                    className="accent-conexia-green"
                  />
                  Ver también proyectos inactivos
                </label>
              </div>
            )}
          </div>
          <section className="flex-1 min-w-0">
            {loading ? (
              <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
            ) : (
              <>
                <ProjectList 
                  projects={projects} 
                  showFinished={true} 
                  showInactive={showInactive} 
                  origin={isOwner ? 'my-projects' : 'user-projects'}
                />
                
                {/* Botón Atrás y Paginado */}
                <div className="mt-6">
                  {/* En móvil: botón atrás a la izquierda y paginado centrado en la misma línea */}
                  <div className="flex items-center md:hidden px-6 sm:px-0">
                    <BackButton
                      text={isOwner ? 'Volver a mi perfil' : 'Atrás'}
                      onClick={() => {
                        if (isOwner) {
                          router.push(`/profile/userProfile/${userId}`);
                        } else {
                          router.back();
                        }
                      }}
                      className="h-[38px] whitespace-nowrap text-sm"
                    />
                    <div className="flex-1 flex justify-center items-center">
                      <div className="flex items-center -mt-6">
                        <Pagination
                          page={pagination.currentPage}
                          origin={isOwner ? 'my-projects' : 'user-projects'}
                          hasPreviousPage={pagination.hasPreviousPage}
                          hasNextPage={pagination.hasNextPage}
                          totalPages={pagination.totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* En desktop: botón atrás a la izquierda, paginado centrado */}
                  <div className="hidden md:flex md:items-center px-6 sm:px-0">
                    <BackButton
                      text={isOwner ? 'Volver a mi perfil' : 'Atrás'}
                      onClick={() => {
                        if (isOwner) {
                          router.push(`/profile/userProfile/${userId}`);
                        } else {
                          router.back();
                        }
                      }}
                      className="h-[38px] whitespace-nowrap text-sm"
                    />
                    <div className="flex-1 flex justify-center items-center">
                      <div className="flex items-center -mt-6">
                        <Pagination
                          page={pagination.currentPage}
                          hasPreviousPage={pagination.hasPreviousPage}
                          hasNextPage={pagination.hasNextPage}
                          totalPages={pagination.totalPages}
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

      {/* Widget de mensajería (igual que en ClientCommunity) */}
      <MessagingWidget avatar={avatar} />
    </>
  );
}