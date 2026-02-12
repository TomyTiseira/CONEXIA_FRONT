import { useEffect, useState } from 'react';
import Toast from '@/components/ui/Toast';
import Navbar from '@/components/navbar/Navbar';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';
import ReportProjectModal from '@/components/project/report/ReportProjectModal';
import { createProjectReport, fetchProjectReports } from '@/service/reports/reportsFetch';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { getMyPostulationsByProjectAndRole } from '@/service/postulations/postulationService';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROLES } from '@/constants/roles';
import DeleteProjectModal from '@/components/project/deleteProject/DeleteProjectModal';

import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { ProjectValidationStatus } from '@/components/project/validation';
// NUEVO: hooks de mensajería + emojis
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { useChatMessages } from '@/hooks/messaging/useChatMessages';
import EmojiPicker from 'emoji-picker-react';
import { IoCheckmarkCircleSharp } from 'react-icons/io5'; // <- NUEVO icono
import MessagingWidget from '@/components/messaging/MessagingWidget';
import ModerationAlert from '@/components/common/ModerationAlert';
import { isProjectModerated } from '@/constants/serviceHirings';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import OwnerSuspensionAlert from '@/components/common/OwnerSuspensionAlert';

// Componente para mostrar cada rol individualmente
function RoleCard({ role, project, isOwner, user, projectId, isModerated, isOwnerRestricted, canUserApply }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [checkingPostulation, setCheckingPostulation] = useState(false);

  const getApplicationTypesText = (applicationTypes, applicationType) => {
    // Si no hay applicationTypes array pero hay applicationType, usar ese
    if ((!applicationTypes || applicationTypes.length === 0) && applicationType) {
      const typeLabels = {
        'CV': 'CV',
        'QUESTIONS': 'Preguntas',
        'EVALUATION': 'Evaluación Técnica',
        'PARTNER': 'Socio',
        'INVESTOR': 'Inversor'
      };
      return typeLabels[applicationType] || applicationType;
    }
    
    if (!applicationTypes || applicationTypes.length === 0) return 'No especificado';
    
    const typeLabels = {
      'CV': 'CV',
      'QUESTIONS': 'Preguntas',
      'EVALUATION': 'Evaluación Técnica',
      'PARTNER': 'Socio',
      'INVESTOR': 'Inversor'
    };
    
    return applicationTypes.map(type => typeLabels[type] || type).join(', ');
  };

  const handleApply = async () => {
    // Verificar si el proyecto está moderado
    if (isModerated) {
      return; // No hacer nada si está moderado
    }
    
    // Verificar si el owner está suspendido o el usuario no puede aplicar
    if (isOwnerRestricted || !canUserApply) {
      return; // No hacer nada si el owner está suspendido o el usuario está suspendido
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Verificar si ya está postulado
    setCheckingPostulation(true);
    try {
      const postulations = await getMyPostulationsByProjectAndRole(projectId, role.id);
      
      // NUEVA REGLA: Verificar si ya tiene CUALQUIER postulación previa
      if (postulations && postulations.length > 0) {
        const lastPostulation = postulations[0];
        const statusCode = lastPostulation.status?.code?.toLowerCase() || '';
        const statusName = lastPostulation.status?.name || 'en proceso';
        
        let message = '';
        if (statusCode === 'rechazada' || statusCode === 'rejected') {
          message = `Tu postulación anterior fue rechazada. No puedes volver a postularte a este rol.`;
        } else if (statusCode === 'aceptada' || statusCode === 'accepted') {
          message = `Tu postulación fue aceptada. Ya formas parte de este rol.`;
        } else if (statusCode === 'cancelada' || statusCode === 'cancelled') {
          message = `Cancelaste tu postulación anterior. No puedes volver a postularte a este rol.`;
        } else if (statusCode === 'expirada' || statusCode === 'expired') {
          message = `Tu postulación anterior expiró. No puedes volver a postularte a este rol.`;
        } else if (statusCode === 'pendiente' || statusCode === 'pending' || statusCode === 'activo' || statusCode === 'active') {
          message = `Ya tienes una postulación ${statusName} para este rol.`;
        } else {
          message = `Ya te postulaste anteriormente a este rol. No puedes volver a postularte.`;
        }
        
        setToast({ 
          type: 'error', 
          message: message
        });
        setCheckingPostulation(false);
        return;
      }
      
      // Si no hay postulaciones previas, redirigir al formulario de aplicación
      setCheckingPostulation(false);
      router.push(`/project/${projectId}/apply/${role.id}`);
    } catch (error) {
      console.error('Error checking postulations:', error);
      setToast({ 
        type: 'error', 
        message: 'Error al verificar postulaciones. Por favor, intenta nuevamente.' 
      });
      setCheckingPostulation(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200">
      {/* Header del rol - siempre visible */}
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-conexia-green">{role.title}</h3>
          {role.description && !isExpanded && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-1">{role.description}</p>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-conexia-green hover:text-conexia-green/80 transition-colors font-medium text-sm"
        >
          {isExpanded ? 'Ocultar' : 'Ver detalles'}
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4">
            {role.description && (
              <div className="mb-4">
                <p className="text-gray-700">{role.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tipos de postulación</label>
                <p className="text-sm text-gray-900">{getApplicationTypesText(role.applicationTypes, role.applicationType)}</p>
              </div>
              
              {role.maxCollaborators && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Vacantes disponibles</label>
                  <p className="text-sm text-gray-900">
                    {role.approvedCount !== undefined 
                      ? `${Math.max(0, role.maxCollaborators - (role.approvedCount || 0))} de ${role.maxCollaborators}`
                      : `${role.maxCollaborators} vacante${role.maxCollaborators !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              )}

              {role.contractType && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de contrato</label>
                  <p className="text-sm text-gray-900">{role.contractType.name || role.contractType}</p>
                </div>
              )}

              {role.collaborationType && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de colaboración</label>
                  <p className="text-sm text-gray-900">{role.collaborationType.name || role.collaborationType}</p>
                </div>
              )}
            </div>

            {role.skills && role.skills.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 block mb-2">Habilidades requeridas</label>
                <div className="flex flex-wrap gap-2">
                  {role.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-conexia-green text-white rounded text-xs"
                    >
                      {skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Solo mostrar evaluación técnica si el usuario es dueño del proyecto */}
            {isOwner && role.evaluation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 overflow-hidden">
                <h4 className="font-medium text-blue-900 mb-2">Evaluación Técnica</h4>
                <p className="text-blue-800 text-sm mb-2 break-words overflow-wrap-anywhere">{role.evaluation.description}</p>
                {role.evaluation.link && (
                  <p className="text-blue-700 text-xs mb-1 break-all overflow-wrap-anywhere">
                    <span className="font-medium">Link:</span> 
                    <a href={role.evaluation.link} target="_blank" rel="noopener noreferrer" className="hover:underline ml-1 inline-block max-w-full">
                      {role.evaluation.link}
                    </a>
                  </p>
                )}
                {role.evaluation.fileUrl && (
                  <p className="text-blue-700 text-xs mb-1 break-words overflow-wrap-anywhere">
                    <span className="font-medium">Archivo:</span> {role.evaluation.fileName || 'Archivo adjunto'}
                  </p>
                )}
                <p className="text-blue-700 text-xs">
                  <span className="font-medium">Tiempo límite:</span> {role.evaluation.days} días
                </p>
              </div>
            )}

            {!isOwner && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleApply}
                  disabled={checkingPostulation || isModerated || isOwnerRestricted || !canUserApply}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    (isModerated || isOwnerRestricted || !canUserApply)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : checkingPostulation
                        ? 'bg-conexia-green text-white opacity-50 cursor-not-allowed'
                        : 'bg-conexia-green text-white hover:bg-conexia-green/90'
                  }`}
                >
                  {checkingPostulation 
                    ? 'Verificando...'
                    : isModerated 
                      ? 'Proyecto No Disponible' 
                      : (isOwnerRestricted || !canUserApply)
                        ? 'No Disponible'
                        : 'Postularme a este rol'
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toast para este rol específico */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
          position="top-center"
          duration={4000}
        />
      )}
    </div>
  );
}

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [toast, setToast] = useState(null); // Toast para resultado de reporte
  const [showRoles, setShowRoles] = useState(false); // Estado para mostrar/ocultar roles
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const { user } = useAuth();
  const { roleName, profile } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadConversations, refreshUnreadCount } = useMessaging(); // NUEVO
  const { sendTextMessageTo } = useChatMessages(); // NUEVO
  
  // ⚠️ CRITICAL: ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC OR RETURNS
  // Hook para verificar si el usuario logueado está suspendido (usando el store)
  const { canCreateContent } = useAccountStatus();

  // Envío real de mensaje (texto + emojis, sin archivos) independiente del chat abierto
  const handleSendMessage = async () => {
    if (!messageText.trim() || !project?.ownerId) return;
    setSendingMessage(true);
    try {
      // Crear mensaje con contexto del proyecto
      const projectLink = `${window.location.origin}/project/${project.id}`;
      const contextMessage = `📋 Consulta sobre el proyecto: "${project.title}"

🔗 Ver proyecto: ${projectLink}

💬 Mensaje:
${messageText.trim()}`;
      
      // enviar texto directo al dueño sin cambiar la selección global
      await sendTextMessageTo({ receiverId: project.ownerId, content: contextMessage });
      // refrescos ligeros
      loadConversations({ page: 1, limit: 10, append: false });
      refreshUnreadCount();

      // feedback al usuario
      setMessageText('');
      setShowEmojis(false);
      setMessageSent(true); // persistente hasta recarga
    } catch (e) {
      // opcional: puedes mostrar un error aquí
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchProjectById(projectId).then((data) => {
      setProject(data);
      setLoading(false);
    });
    // Verificar si el usuario ya reportó este proyecto
    // Solo para admins/moderadores que pueden ver los reportes
    if (user && projectId && (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR)) {
      fetchProjectReports(projectId).then((data) => {
        const reports = data?.data?.reports || [];
        const found = reports.find(r => String(r.userId) === String(user.id));
        setAlreadyReported(!!found);
      }).catch((error) => {
        // Manejar errores que no sean 403
        console.error('Error fetching project reports:', error);
        setAlreadyReported(false);
      });
    }
  }, [projectId, user, roleName]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-conexia-green">Proyecto no encontrado</div>;

  // Función para mostrar nombre completo del propietario
  const getOwnerName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.trim() || 'Usuario';
  };

  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);
  const isModerated = isProjectModerated(project);
  
  // Validar estado del owner usando ownerAccountStatus como fuente de verdad
  const isOwnerSuspended = project?.ownerAccountStatus === 'suspended';
  const isOwnerBanned = project?.ownerAccountStatus === 'banned';
  const canInteractWithOwner = !isOwnerSuspended && !isOwnerBanned;
  
  // El usuario puede postularse solo si:
  // 1. El owner del proyecto NO está suspendido/baneado
  // 2. El usuario logueado NO está suspendido
  const canUserApply = canInteractWithOwner && canCreateContent;
  const isOwnerRestricted = !canInteractWithOwner;
  
  const skills = Array.isArray(project.skills) ? project.skills : (project.skills ? [project.skills] : []);
  const ownerName = getOwnerName(project.owner || ''); // owner ya viene como string completo del backend
  const ownerImage = project.ownerImage || null; // ownerImage ya viene como string del backend
  const contractTypes = Array.isArray(project.contractType) ? project.contractType : (project.contractType ? [project.contractType] : []);
  const collaborationTypes = Array.isArray(project.collaborationType) ? project.collaborationType : (project.collaborationType ? [project.collaborationType] : []);
  const categories = Array.isArray(project.category) ? project.category : (project.category ? [project.category] : []);

  // Helper para asegurar URLs absolutas
  const { config } = require('@/config');
  const getImageUrl = (img, isProjectImage = false) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    if (isProjectImage) {
      return `${config.IMAGE_URL}/projects/images/${img}`;
    }
    return `${config.IMAGE_URL}/${img}`;
  };

  // Avatar del usuario logueado (para el widget), reutilizando getImageUrl
  const avatar = profile?.profilePicture ? getImageUrl(profile.profilePicture) : '/images/default-avatar.png';

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
          {/* Botón tres puntos: absolute en la esquina del card, tanto mobile como desktop */}
          {/* Usuarios normales: solo si no es owner y no está moderado */}
          {/* Admins/Moderadores: siempre mostrar para acceder a ver reportes */}
          {((!isOwner && !isModerated) || (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR)) && (
            <div className="absolute top-4 right-6 md:right-8 z-30">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Más opciones"
              >
                <MoreVertical size={22} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
                    {roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR ? (
                      <button
                        className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                        style={{ boxShadow: '0 2px 8px 0 rgba(167, 119, 119, 0.06)' }}
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
                      </button>
                    ) : (
                      <button
                        className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                        onClick={() => {
                          setMenuOpen(false);
                          if (project.hasReported) {
                            setToast({ type: 'warning', message: 'Ya has reportado este proyecto', isVisible: true });
                            return;
                          }
                          setShowReportModal(true);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {/* Icono advertencia simple */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                            <circle cx="12" cy="16" r="1.2" fill="currentColor" />
                            <rect x="11.1" y="7" width="1.8" height="6" rx="0.9" fill="currentColor" />
                          </svg>
                          <span>Reportar proyecto</span>
                        </span>
                      </button>
                    )}
                </div>
              )}
            </div>
          )}
          
          {/* Banner de moderación (solo mostrar si NO es por baneo del owner) */}
          {isModerated && !isOwnerBanned && (
            <ModerationAlert type="project" className="mb-6" />
          )}
          
          {/* Banner de owner suspendido/baneado (prioridad sobre el banner de moderación) */}
          {(isOwnerSuspended || isOwnerBanned) && (
            <OwnerSuspensionAlert 
              data={project} 
              contentType="proyecto" 
              className="mb-6" 
              isOwner={isOwner}
            />
          )}
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Imagen */}
            <div className="flex flex-col items-center md:items-start w-full md:w-56">
              <div className="relative w-48 h-48 rounded-xl border-4 border-white bg-[#f3f9f8] overflow-hidden mb-2 shadow-sm">
                {project.image ? (
                  <Image
                    src={getImageUrl(project.image, true)}
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
              
              {/* Dueño del proyecto */}
              <div className="flex items-center gap-3 mt-3">
                <div 
                  className="relative w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
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
                      sizes="48px"
                    />
                  ) : (
                    <Image
                      src="/logo.png"
                      alt="Sin imagen"
                      fill
                      className="object-contain rounded-full border bg-gray-200"
                      sizes="48px"
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
                  <span className="text-conexia-green font-semibold text-sm break-words hover:underline">{ownerName}</span>
                  <span className="text-xs text-gray-500">Dueño del proyecto</span>
                </div>
              </div>
            </div>
            {/* Info principal */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="flex items-center justify-between relative">
                <h1 className="text-3xl font-bold text-conexia-green break-words whitespace-pre-line break-all word-break-break-all max-w-[90vw] md:max-w-[80%] truncate">{project.title || 'Sin título'}</h1>
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





              
              {/* Estado de validación del proyecto */}
              <ProjectValidationStatus
                project={project}
                user={user}
                isOwner={isOwner}
                userRole={roleName}
              />
            </div>
          </div>
          
          {/* Botones del propietario */}
          {isOwner && (
            <div className="mt-6 flex flex-col md:flex-row items-end gap-2 justify-end">
              <button
                className="bg-conexia-green text-white px-3 md:px-5 py-2 rounded font-semibold hover:bg-conexia-green/90 transition text-sm"
                onClick={() => router.push(`/project/${projectId}/postulations`)}
              >
                Ver postulaciones
              </button>
              {!project.isActive || !project.deletedAt && (
                <button
                  className="bg-conexia-coral text-white px-3 md:px-5 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition text-sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Eliminar proyecto
                </button>
              )}
            </div>
          )}
          
          {/* Mensaje al creador tipo Facebook mejorado y responsivo, alineado y compacto */}
          {!isOwner && !isModerated && roleName !== ROLES.ADMIN && roleName !== ROLES.MODERATOR && (
            <div className="mt-8 w-full">
              {/* Usar el mismo contenedor con altura mínima en ambos estados */}
              {messageSent ? (
                <div className="bg-[#f3f9f8] border border-conexia-green/30 rounded-lg p-4 shadow-sm min-h-[96px] flex items-center justify-center gap-3">
                  <IoCheckmarkCircleSharp size={22} className="text-green-500 flex-shrink-0" />
                  <span className="text-conexia-green font-semibold">
                    Mensaje enviado al creador del proyecto
                  </span>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-row items-center gap-2 shadow-sm min-h-[96px]" style={{boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}>
                  <div className="flex-1 w-full flex flex-col">
                    <label htmlFor="mensajeCreador" className="flex items-center gap-1 font-semibold text-conexia-green mb-1 text-[11px] md:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5 text-conexia-green">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                      </svg>
                      <span className="truncate">Envía un mensaje al creador del proyecto</span>
                    </label>
                    <div className="flex flex-row items-center gap-2 w-full">
                      {/* Input con icono de emoji adentro (derecha) */}
                      <div className="relative flex-1">
                        <input
                          id="mensajeCreador"
                          type="text"
                          placeholder="Escribe tu consulta..."
                          className="w-full rounded-lg px-3 pr-8 py-2 bg-white border border-gray-300 focus:outline-none focus:border-gray-500 text-[11px] md:text-sm text-gray-800 transition-all duration-150"
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          maxLength={300}
                          style={{minHeight: '34px'}}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-conexia-green/70 hover:text-conexia-green"
                          title="Emoji"
                          onClick={() => setShowEmojis(v => !v)}
                        >
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#1e6e5c" strokeWidth="2"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="#1e6e5c"/><circle cx="15" cy="10" r="1" fill="#1e6e5c"/></svg>
                        </button>
                        {showEmojis && (
                          <div className="absolute right-0 bottom-full mb-2 z-50">
                            <EmojiPicker
                              onEmojiClick={(emojiData) => {
                                const e = emojiData?.emoji || '';
                                if (e) setMessageText(prev => prev + e);
                                setShowEmojis(false);
                              }}
                              searchDisabled
                              skinTonesDisabled
                              height={320}
                              width={280}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="neutral"
                        className={`text-[11px] md:text-sm px-4 md:px-5 py-2 rounded-lg transition-all duration-200 relative ${
                          !messageText.trim() || sendingMessage
                            ? 'after:absolute after:inset-0 after:bg-gray-400 after:opacity-40 after:rounded-lg after:pointer-events-none'
                            : ''
                        }`}
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        style={{minWidth: '70px', height: '34px'}}
                      >
                        {sendingMessage ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Sección de Roles Colapsable */}
          {project.roles && project.roles.length > 0 && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header de roles - siempre visible */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-conexia-green">Roles disponibles</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {project.roles.length} {project.roles.length === 1 ? 'rol disponible' : 'roles disponibles'}
                  </p>
                </div>
                <button
                  onClick={() => setShowRoles(!showRoles)}
                  className="flex items-center gap-2 text-conexia-green hover:text-conexia-green/80 transition-colors font-medium text-sm"
                >
                  {showRoles ? 'Ocultar roles' : 'Ver roles'}
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${showRoles ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Contenido de roles expandible */}
              {showRoles && (
                <div className="p-6">
                  <div className="space-y-6">
                    {project.roles.map((role, index) => (
                      <RoleCard 
                        key={role.id || index} 
                        role={role} 
                        project={project}
                        isOwner={isOwner}
                        user={user}
                        projectId={projectId}
                        isModerated={isModerated}
                        isOwnerRestricted={isOwnerRestricted}
                        canUserApply={canUserApply}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          

          
          {/* Botón Atrás al final */}
          <div className="mt-8 flex justify-start">
            <BackButton
              onClick={() => {
                // Lógica: si viene de reportes de un proyecto, volver a esa página
                // Si viene de la lista general de reportes, volver a /reports
                const from = searchParams.get('from');
                const fromReportsProjectId = searchParams.get('fromReportsProjectId');
                if (from === 'reports-project' && fromReportsProjectId) {
                  router.push(`/reports/project/${fromReportsProjectId}`);
                } else if (from === 'reports') {
                  router.push('/reports');
          } else if (from === 'profile' && project && project.ownerId) {
            router.push(`/profile/userProfile/${project.ownerId}`);
                } else if (from === 'user-projects' && project.ownerId) {
                  router.push(`/projects/user/${project.ownerId}`);
                } else if (from === 'my-projects') {
                  router.push('/my-projects');
                } else {
                  router.push('/project/search');
                }
              }}
            />
          </div>
        </div>

        {/* Modal de eliminación fuera del contenedor principal */}
        {showDeleteModal && (
          <DeleteProjectModal
            projectId={projectId}
            project={project}
            searchParams={searchParams}
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
            onSubmit={async (data) => {
              setReportLoading(true);
              // Cerrar modal inmediatamente
              setShowReportModal(false);
              try {
                await createProjectReport({
                  projectId: Number(projectId),
                  reason: data.reason,
                  otherReason: data.other,
                  description: data.description,
                });
                
                // Actualizar el estado local para marcar como reportado
                setProject(prev => ({ ...prev, hasReported: true }));
                
                setToast({ type: 'success', message: 'Proyecto reportado con éxito.', isVisible: true });
                setAlreadyReported(true);
              } catch (err) {
                const alreadyReportedRegex = /Project with id \d+ has already been reported by user \d+/;
                const conflict = (
                  (err.message && err.message.toLowerCase().includes('conflict')) ||
                  (err.message && alreadyReportedRegex.test(err.message))
                );
                if (conflict) {
                  setToast({ type: 'warning', message: 'Ya has reportado este proyecto.', isVisible: true });
                  setAlreadyReported(true);
                } else {
                  console.error('Error al reportar proyecto:', err);
                  setToast({ type: 'error', message: 'Error al reportar el proyecto. Inténtalo más tarde.', isVisible: true });
                }
              } finally {
                setReportLoading(false);
              }
            }}
          />
        )}
      </div>

      {/* Widget de mensajería reutilizable (igual que en ClientCommunity/ProjectSearch) */}
      <MessagingWidget
        avatar={avatar}
      />
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          duration={4000}
        />
      )}
    </>
  );
}
