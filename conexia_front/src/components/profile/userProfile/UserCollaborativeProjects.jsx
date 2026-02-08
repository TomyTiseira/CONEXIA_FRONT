

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyProjects } from '@/service/projects/projectsFetch';
import ProjectList from '@/components/project/search/ProjectList';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { MdFolderOpen } from 'react-icons/md';

export default function UserCollaborativeProjects({ userId }) {
  const { user: authUser } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determinar si el usuario autenticado es el dueño
  const isOwner = authUser && userId && String(authUser.id) === String(userId);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      setLoading(true);
  const res = await fetchMyProjects({ ownerId: userId, active: true });
  setProjects(res.projects || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  // No mostrar nada mientras carga
  if (loading) {
    return null;
  }

  // No mostrar la sección si no hay proyectos
  if (!projects || projects.length === 0) {
    return null;
  }

  // Mostrar solo los primeros 3 proyectos
  const topProjects = projects.slice(0, 3);

  return (
    <div className="mt-8">
      <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <MdFolderOpen className="w-6 h-6 text-conexia-green" />
          <h3 className="text-base md:text-lg font-bold text-conexia-green">
            {isOwner ? 'Mis proyectos colaborativos' : `Proyectos colaborativos`}
          </h3>
        </div>
        <div className="text-gray-500 text-xs md:text-sm mb-2">Proyectos publicados recientemente en la comunidad.</div>
        <div className="w-full">
          <ProjectList 
            projects={topProjects} 
            showFinished={true} 
            showInactive={false} 
            origin={isOwner ? 'my-projects-preview' : 'user-projects-preview'}
            className=""
          />
        </div>
        {projects.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
            <Link
              href={`/projects/user/${userId}`}
              className="w-full sm:w-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
              style={{ minHeight: '40px' }}
            >
              <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              <span className="w-full text-center">Ver más…</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
