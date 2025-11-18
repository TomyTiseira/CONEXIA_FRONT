import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchMyProjects } from '@/service/projects/projectsFetch';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import NavbarModerator from '@/components/navbar/NavbarModerator';
import { PlanComparisonBanner } from '@/components/plans';
import ProjectList from './ProjectList';
import Toast from '@/components/ui/Toast';

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
  const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

  // Determinar si el usuario autenticado es el dueño de los proyectos que se están viendo
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  // Leer sessionStorage para toast de eliminación de proyecto
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deletion = sessionStorage.getItem('projectDeletionToast');
      if (deletion) {
        try {
          const data = JSON.parse(deletion);
          setToast({ isVisible: true, type: data.type || 'success', message: data.message || 'Proyecto eliminado correctamente.' });
        } catch {
          // ignore parse error
        } finally {
          sessionStorage.removeItem('projectDeletionToast');
        }
      }
    }
  }, []);

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
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-4">
          {/* Plan Comparison Banner - Solo para usuarios propietarios */}
          {isOwner && authUser?.role === ROLES.USER && (
            <div className="mb-6">
              <PlanComparisonBanner context="projects" />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight">
                  {isOwner ? 'Mis Proyectos' : 'Proyectos del Usuario'}
                </h1>
                <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                  {isOwner 
                    ? 'Gestiona y visualiza todos tus proyectos colaborativos' 
                    : 'Explora los proyectos colaborativos de este usuario'
                  }
                </p>
              </div>
              
              {/* Filtros (solo para el propietario) */}
              {isOwner && (
                <div className="flex items-center justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
                  <label className="flex items-center gap-2 cursor-pointer bg-white rounded-lg shadow-sm border p-3">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={e => setShowInactive(e.target.checked)}
                      className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Ver también proyectos inactivos
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Resultados */}
          <div className="mb-6">
            {!loading && projects.length > 0 && (
              <p className="text-gray-600 text-sm">
                Mostrando {projects.length} de {pagination.totalItems} proyecto{pagination.totalItems !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Lista de proyectos */}
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
                <div className="flex items-center md:hidden">
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
                  {/* Siempre mostrar paginado en móvil */}
                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex items-center -mt-6">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  </div>
                </div>
                
                {/* En desktop: botón atrás a la izquierda, paginado centrado */}
                <div className="hidden md:flex md:items-center">
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
                  {/* Siempre mostrar paginado en desktop */}
                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex items-center -mt-6">
                      <Pagination
                        currentPage={pagination.currentPage}
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
        </div>
      </div>

      {/* Widget de mensajería (igual que en ClientCommunity) */}
      <MessagingWidget avatar={avatar} />

      {/* Toast para eliminación de proyecto */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        position="top-center"
        duration={4000}
      />
    </>
  );
}