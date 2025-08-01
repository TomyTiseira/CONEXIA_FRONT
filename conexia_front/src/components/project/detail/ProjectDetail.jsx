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

  return (
    <>
      <NavbarCommunity />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-2 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <img src={project.image} alt={project.title} className="w-48 h-48 object-cover rounded-xl border mx-auto md:mx-0" />
            <div className="flex-1 flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-conexia-green mb-2">{project.title}</h1>
              <div className="text-conexia-green/80 text-sm mb-2">{project.category} | {project.collaborationType}</div>
              <div className="text-base mb-4">{project.description}</div>
              <div className="flex items-center gap-2 mb-2">
                <img src={project.ownerImage} alt={project.ownerName} className="w-10 h-10 rounded-full border" />
                <span className="text-conexia-green font-semibold">{project.ownerName}</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {project.skills.map(skill => (
                  <span key={skill} className="bg-conexia-green/10 text-conexia-green px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                ))}
              </div>
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
