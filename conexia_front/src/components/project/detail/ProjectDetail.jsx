import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';
import ReportProjectModal from '@/components/project/report/ReportProjectModal';
import { createProjectReport, fetchProjectReports } from '@/service/reports/reportsFetch';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROLES } from '@/constants/roles';
import DeleteProjectModal from '@/components/project/deleteProject/DeleteProjectModal';
import { PostulationButton } from '@/components/project/postulation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { ProjectValidationStatus } from '@/components/project/validation';

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Simulación de envío de mensaje
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      setMessageSent(true);
      setMessageText("");
      setTimeout(() => setMessageSent(false), 2500);
    }, 1200);
  };


  useEffect(() => {
    fetchProjectById(projectId).then((data) => {
      setProject(data);
      setLoading(false);
    });
    // Verificar si el usuario ya reportó este proyecto
    if (user && projectId) {
      fetchProjectReports(projectId).then((data) => {
        const reports = data?.data?.reports || [];
        const found = reports.find(r => String(r.userId) === String(user.id));
        setAlreadyReported(!!found);
      }).catch(() => setAlreadyReported(false));
    }
  }, [projectId, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-conexia-green">Proyecto no encontrado</div>;

  // Función para mostrar primer nombre y primer apellido
  const getShortName = (fullName) => {
    if (!fullName) return 'Usuario';
    const names = fullName.trim().split(' ').filter(name => name.length > 0);
    
    if (names.length === 0) return 'Usuario';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} ${names[1]}`;
    
    // Para 3 o más nombres, asumimos: Primer_Nombre [Segundo_Nombre] Primer_Apellido [Segundo_Apellido]
    // Tomamos el primer nombre (names[0]) y el primer apellido (names[2] si existe, sino names[1])
    if (names.length >= 3) {
      return `${names[0]} ${names[2]}`;
    }
    
    return `${names[0]} ${names[1]}`;
  };

  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);
  
  const skills = Array.isArray(project.skills) ? project.skills : (project.skills ? [project.skills] : []);
  const ownerName = getShortName(project.owner || ''); // owner ya viene como string del backend
  const ownerImage = project.ownerImage || null; // ownerImage ya viene como string del backend
  const contractTypes = Array.isArray(project.contractType) ? project.contractType : (project.contractType ? [project.contractType] : []);
  const collaborationTypes = Array.isArray(project.collaborationType) ? project.collaborationType : (project.collaborationType ? [project.collaborationType] : []);
  const categories = Array.isArray(project.category) ? project.category : (project.category ? [project.category] : []);

  // Helper para asegurar URLs absolutas
  const { config } = require('@/config');
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    return `${config.IMAGE_URL}/${img}`;
  };

  return (
    <>
      <Navbar />
      <div 
        className="min-h-[calc(100vh-64px)] relative py-8 px-6 md:px-6 flex flex-col items-center overflow-x-hidden pb-20 md:pb-8 bg-[#f3f9f8]"
      >
        {/* Fondo decorativo imagen cubriendo todo */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: 'url(/project_funds.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.25
          }}
          aria-hidden="true"
        ></div>
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8 z-10 relative mt-4">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Imagen */}
            <div className="flex flex-col items-center md:items-start w-full md:w-56">
              <div className="relative w-48 h-48 rounded-xl border-4 border-white bg-[#f3f9f8] overflow-hidden mb-2 shadow-sm">
                {project.image ? (
                  <Image
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="192px"
                  />
                ) : (
                  <Image
                    src="/default_project.jpeg"
                    alt="Imagen por defecto"
                    fill
                    className="object-cover rounded-xl"
                    sizes="192px"
                  />
                )}
              </div>
            </div>
            {/* Info principal */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-conexia-green break-words">{project.title || 'Sin título'}</h1>
                {!isOwner && !alreadyReported && (
                  <div className="relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() => setMenuOpen(!menuOpen)}
                      aria-label="Más opciones"
                    >
                      <MoreVertical size={22} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-20">
                          {roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR ? (
                            <Button
                              variant="edit"
                              className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold"
                              onClick={() => {
                                setMenuOpen(false);
                                router.push(`/reports/project/${projectId}`);
                              }}
                            >
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Ver reportes</span>
                              </span>
                            </Button>
                          ) : (
                            !alreadyReported && (
                              <button
                                className="w-full flex items-center justify-center px-6 py-3 hover:bg-gray-50 gap-3 text-conexia-coral font-semibold"
                                onClick={() => {
                                  setMenuOpen(false);
                                  setShowReportModal(true);
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-conexia-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                  </svg>
                                  <span>Reportar proyecto</span>
                                </span>
                              </button>
                            )
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-1">
                {categories.length > 0 && categories.map((cat) => (
                  <span key={cat} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{cat}</span>
                ))}
                {collaborationTypes.length > 0 && collaborationTypes.map((type) => (
                  <span key={type} className="bg-conexia-green/10 text-conexia-green px-3 py-1 rounded-full text-xs font-semibold">{type}</span>
                ))}
                {contractTypes.length > 0 && contractTypes.map((type) => (
                  <span key={type} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">{type}</span>
                ))}
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-semibold mb-1">Descripción</span>
                <div className="text-base break-words whitespace-pre-line text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{project.description || 'Sin descripción'}</div>
              </div>
              {project.location && (
                <div>
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Ubicación</span>
                  <div className="text-base break-words text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{project.location}</div>
                </div>
              )}
              {skills.length > 0 && (
                <div className="mt-2">
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Habilidades requeridas</span>
                  <div className="flex gap-2 flex-wrap">
                    {skills.map(skill => (
                      <div
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-conexia-green text-white rounded-full text-sm"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                {project.maxCollaborators && (
                  <div className="text-sm text-gray-500">Máx. colaboradores: <span className="font-semibold text-gray-700">{project.maxCollaborators}</span></div>
                )}
                {project.startDate && (
                  <div className="text-sm text-gray-500 sm:ml-2">Inicio: <span className="font-semibold text-gray-700">{new Date(project.startDate).toLocaleDateString()}</span></div>
                )}
                {project.endDate && (
                  <div className="text-sm text-gray-500 sm:ml-2">Fin: <span className="font-semibold text-gray-700">{new Date(project.endDate).toLocaleDateString()}</span></div>
                )}
              </div>
              {/* Dueño del proyecto */}
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className="relative w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (project.ownerId) {
                      router.push(`/profile/userProfile/${project.ownerId}`);
                    }
                  }}
                >
                  {ownerImage ? (
                    <Image
                      src={getImageUrl(ownerImage)}
                      alt={ownerName}
                      fill
                      className="object-cover rounded-full border"
                      sizes="40px"
                    />
                  ) : (
                    <Image
                      src="/logo.png"
                      alt="Sin imagen"
                      fill
                      className="object-contain rounded-full border bg-gray-200"
                      sizes="40px"
                    />
                  )}
                </div>
                <div 
                  className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={() => {
                    if (project.ownerId) {
                      router.push(`/profile/userProfile/${project.ownerId}`);
                    }
                  }}
                >
                  <span className="text-conexia-green font-semibold text-base break-words hover:underline">{ownerName}</span>
                  <span className="text-xs text-gray-500">Dueño del proyecto</span>
                </div>
              </div>

              {/* Mensaje al creador tipo Facebook mejorado y responsivo, alineado y compacto */}
              {!isOwner && (
                <div className="mt-1 w-full">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-row items-center gap-2 shadow-sm" style={{boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}>
                    <div className="flex-1 w-full flex flex-col">
                      <label htmlFor="mensajeCreador" className="flex items-center gap-1 font-semibold text-conexia-green mb-1 text-[11px] md:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5 text-conexia-green">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                        </svg>
                        <span className="truncate">Envía un mensaje al creador del proyecto</span>
                      </label>
                      <div className="flex flex-row items-center gap-2 w-full">
                        <input
                          id="mensajeCreador"
                          type="text"
                          placeholder="Escribe tu consulta..."
                          className="w-full rounded-lg px-3 py-2 bg-white border border-gray-300 focus:outline-none focus:border-gray-500 text-[11px] md:text-sm text-gray-800 transition-all duration-150"
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          maxLength={300}
                          style={{minHeight: '34px'}}
                        />
                        <Button
                          type="button"
                          variant="neutral"
                          className="text-[11px] md:text-sm px-4 md:px-5 py-2 rounded-lg [&:disabled]:opacity-100"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendingMessage}
                          style={{minWidth: '70px', height: '34px'}}
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                  {messageSent && (
                    <div className="mt-2 text-green-600 text-sm font-medium">¡Mensaje enviado al creador!</div>
                  )}
                </div>
              )}
              
              {/* Estado de validación del proyecto */}
              <ProjectValidationStatus
                project={project}
                user={user}
                isOwner={isOwner}
                userRole={roleName}
              />
            </div>
          </div>
          {/* Fila de botones que abarca ambas columnas */}
          <div className="mt-6 w-full flex flex-row items-end justify-between gap-2">
            {/* Botón Atrás extremo izquierdo */}
            <div className="flex-shrink-0">
              <BackButton
                onClick={() => {
                  // Lógica de navegación según origen
                  const from = searchParams.get('from');
                  if (from === 'user-projects' && project.ownerId) {
                    router.push(`/projects/user/${project.ownerId}`);
                  } else if (from === 'my-projects' && user && user.id) {
                    router.push(`/projects/user/${user.id}`);
                  } else {
                    router.push('/project/search');
                  }
                }}
              />
            </div>
            {/* Botones a la derecha: apilados en mobile, en fila en desktop */}
            <div className="flex flex-col md:flex-row items-end gap-2">
              {!isOwner && (
                <PostulationButton
                  projectId={projectId}
                  projectTitle={project.title}
                  project={project}
                  isOwner={isOwner}
                  userRole={roleName}
                  initialIsApplied={project.isApplied || false}
                  className="text-sm px-3 py-2"
                />
              )}
              {isOwner && (
                <>
                  <button
                    className="bg-conexia-green text-white px-3 md:px-5 py-2 rounded font-semibold hover:bg-conexia-green/90 transition text-sm"
                    onClick={() => router.push(`/project/${projectId}/postulations`)}
                  >
                    Ver Postulaciones
                  </button>
                  {!project.isActive || !project.deletedAt && (
                    <button
                      className="bg-conexia-coral text-white px-3 md:px-5 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition text-sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Eliminar proyecto
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Modal de eliminación fuera del contenedor principal */}
        {showDeleteModal && (
          <DeleteProjectModal
            projectId={projectId}
            onCancel={() => setShowDeleteModal(false)}
            onProjectDeleted={() => {
              setShowDeleteModal(false);
              // Opcional: recargar o redirigir
            }}
          />
        )}
        {/* Modal de reporte de proyecto */}
        {showReportModal && (
          <ReportProjectModal
            onCancel={() => setShowReportModal(false)}
            loading={reportLoading}
            onSubmit={async (data, setMsg) => {
              setReportLoading(true);
              setMsg(null);
              try {
                await createProjectReport({
                  projectId: Number(projectId),
                  reason: data.reason,
                  otherReason: data.other,
                  description: data.description,
                });
                setMsg({ ok: true, text: 'Proyecto reportado con éxito.' });
                setTimeout(() => setShowReportModal(false), 1500);
              } catch (err) {
                // Interceptar mensaje exacto del backend
                const alreadyReportedRegex = /Project with id \d+ has already been reported by user \d+/;
                if (
                  (err.message && err.message.toLowerCase().includes('conflict')) ||
                  (err.message && alreadyReportedRegex.test(err.message))
                ) {
                  setMsg({ ok: false, text: 'Ya has reportado este proyecto.' });
                  setTimeout(() => setShowReportModal(false), 1500);
                } else {
                  setMsg({ ok: false, text: err.message || 'Error al reportar el proyecto' });
                }
              } finally {
                setReportLoading(false);
              }
            }}
          />
        )}
      </div>
    </>
  );
}
