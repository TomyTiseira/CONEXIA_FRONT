import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import { useEffect, useState } from 'react';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProjectById(projectId).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-conexia-green">Proyecto no encontrado</div>;

  const isOwner = user && project && String(user.id) === String(project.ownerId);
  const skills = Array.isArray(project.skills) ? project.skills : (project.skills ? [project.skills] : []);
  const ownerName = project.ownerName || project.owner || '';
  const ownerImage = project.ownerImage || null;
  const contractTypes = Array.isArray(project.contractType) ? project.contractType : (project.contractType ? [project.contractType] : []);
  const collaborationTypes = Array.isArray(project.collaborationType) ? project.collaborationType : (project.collaborationType ? [project.collaborationType] : []);
  const categories = Array.isArray(project.category) ? project.category : (project.category ? [project.category] : []);

  return (
    <>
      <NavbarCommunity />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-2 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {project.image ? (
              <img src={project.image} alt={project.title} className="w-48 h-48 object-cover rounded-xl border mx-auto md:mx-0" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center rounded-xl border bg-gray-100 mx-auto md:mx-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v8.25M3 16.5A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5M3 16.5l4.72-4.72a2.25 2.25 0 013.18 0l.84.84a2.25 2.25 0 003.18 0l2.72-2.72a2.25 2.25 0 013.18 0L21 12.75" />
                </svg>
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-conexia-green mb-2">{project.title || 'Sin título'}</h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.length > 0 && categories.map((cat) => (
                  <span key={cat} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium truncate">{cat}</span>
                ))}
                {contractTypes.length > 0 && contractTypes.map((type) => (
                  <span key={type} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium truncate">{type}</span>
                ))}
                {collaborationTypes.length > 0 && collaborationTypes.map((type) => (
                  <span key={type} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium truncate">{type}</span>
                ))}
              </div>
              <div className="text-base mb-4">{project.description || 'Sin descripción'}</div>
              <div className="flex items-center gap-2 mb-2">
                {ownerImage ? (
                  <img src={ownerImage} alt={ownerName} className="w-10 h-10 rounded-full border" />
                ) : (
                  <div className="w-10 h-10 rounded-full border bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368" />
                    </svg>
                  </div>
                )}
                <span className="text-conexia-green font-semibold">{ownerName}</span>
              </div>
              {skills.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {skills.map(skill => (
                    <span key={skill} className="bg-conexia-green/10 text-conexia-green px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                  ))}
                </div>
              )}
              <div className="text-conexia-green font-bold text-lg mt-2">{project.price ? `$${project.price}` : 'A convenir'}</div>
              <div className="mt-4 flex gap-3">
                <button className="bg-conexia-coral text-white px-5 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition">Contactar</button>
                {isOwner ? (
                  <button className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700 transition">Dar de baja proyecto</button>
                ) : (
                  <button className="bg-conexia-green/90 text-white px-5 py-2 rounded font-semibold hover:bg-conexia-green transition">Postularse a proyecto</button>
                )}
                <button className="bg-gray-200 text-conexia-green px-5 py-2 rounded font-semibold hover:bg-gray-300 transition" onClick={() => router.push(`/profile/userProfile/${project.ownerId}`)}>Ver perfil</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
