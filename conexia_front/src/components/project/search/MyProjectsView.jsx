
import { useEffect, useState } from 'react';
import { fetchProjects } from '@/service/projects/projectsFetch';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import ProjectList from './ProjectList';
import { useAuth } from '@/context/AuthContext';

export default function MyProjectsView({ userId, isOwner: isOwnerProp }) {
  const { user: authUser } = useAuth();
  const isOwner = isOwnerProp ?? (authUser && userId && String(authUser.id) === String(userId));
  const [showInactive, setShowInactive] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId && !authUser) return;
    async function load() {
      setLoading(true);
      const res = await fetchProjects({ ownerId: userId || authUser.id, active: isOwner ? (showInactive ? undefined : true) : true });
      setProjects(res);
      setLoading(false);
    }
    load();
  }, [userId, authUser, isOwner, showInactive]);

  return (
    <>
      <NavbarCommunity />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-2 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2 w-full">
            <h1 className="text-3xl font-bold text-conexia-green bg-white rounded-lg px-6 py-3 shadow-sm w-full md:w-[320px] text-center md:text-left">Mis Proyectos</h1>
            {isOwner && (
              <label className="flex items-center gap-2 ml-4 text-conexia-green font-medium cursor-pointer">
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
              <ProjectList projects={projects} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
