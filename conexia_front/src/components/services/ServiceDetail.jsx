import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useServiceDetail } from '@/hooks/services';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { getUnitLabel } from '@/utils/timeUnit';
import { FaClock, FaUser, FaEdit, FaTrash, FaHandshake, FaComments, FaArrowLeft, FaTag, FaCalendar, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { MoreVertical, Star } from 'lucide-react';
import { config } from '@/config';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Navbar from '@/components/navbar/Navbar';
import ServiceImageCarousel from './ServiceImageCarousel';
import ImageZoomModalServiceDetail from './ImageZoomModalServiceDetail';
import ServiceDeactivateModal from './ServiceDeactivateModal';
import ServiceDeleteConflictModal from '@/components/ui/ServiceDeleteConflictModal';
import ServiceEditModal from './ServiceEditModal';
import ServiceHiringModal from './ServiceHiringModal';
import ServiceHiringActionsModal from './ServiceHiringActionsModal';
import ReportServiceModal from './ReportServiceModal';
import QuotationModal from './QuotationModal';
import ServiceReviewsSection from './ServiceReviewsSection';
import { getServiceReviews } from '@/service/serviceReviews';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { useChatMessages } from '@/hooks/messaging/useChatMessages';
import { useDeleteService } from '@/hooks/services/useDeleteService';
import { useEditService } from '@/hooks/services/useEditService';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import Toast from '@/components/ui/Toast';
import EmojiPicker from 'emoji-picker-react';
import { createServiceReport, fetchServiceReports } from '@/service/reports/serviceReportsFetch';

const ServiceDetail = ({ serviceId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const { service, loading, error, loadServiceDetail } = useServiceDetail(serviceId);
  const { removeService, loading: isDeleting } = useDeleteService();
  const { editService, loading: isEditing } = useEditService();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [pendingHiring, setPendingHiring] = useState(null);
  // Modal de cotización detallada
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationHiring, setQuotationHiring] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toast, setToast] = useState(null);
  // Report/overflow menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  // Estado de ya reportado (para ocultar el botón y mostrar toast en su lugar)
  const [alreadyReportedService, setAlreadyReportedService] = useState(false);
  // Modal de zoom de imagen
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  // Estado para estadísticas de reseñas
  const [reviewsStats, setReviewsStats] = useState(null);

  const searchParams = useSearchParams();
  const handleShowImageZoom = (index = 0) => {
    setZoomIndex(index);
    setShowImageZoom(true);
  };
  const handleCloseImageZoom = () => {
    setShowImageZoom(false);
    setZoomIndex(0);
  };
  
  // Messaging state
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Messaging hooks
  const { loadConversations, refreshUnreadCount } = useMessaging();
  const { sendTextMessageTo } = useChatMessages();
  
  // Service hirings hook
  const { cancelHiring } = useServiceHirings();

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProfileImageSrc = () => {
    if (imageError || !service?.owner?.profileImage) {
      return '/images/default-avatar.png';
    }
    
    const imagePath = service.owner.profileImage;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Usar config.IMAGE_URL como en proyectos
    return `${config.IMAGE_URL}/${imagePath}`;
  };

  // Consultar si el usuario ya reportó este servicio (para ocultar la acción de reportar)
  useEffect(() => {
    const checkAlreadyReported = async () => {
      try {
        if (user && serviceId) {
          const data = await fetchServiceReports(serviceId, 1, 50);
          const reports = data?.data?.reports || data?.reports || [];
          const found = reports.find(r => String(r.userId) === String(user.id));
          if (found) setAlreadyReportedService(true);
        }
      } catch (_) {
        // Ignorar silenciosamente
      }
    };
    checkAlreadyReported();
  }, [user, serviceId]);

  // Cargar estadísticas de reseñas
  useEffect(() => {
    const loadReviewsStats = async () => {
      try {
        if (serviceId) {
          const data = await getServiceReviews(serviceId, 1, 1); // Solo necesitamos las estadísticas
          setReviewsStats({
            total: data.pagination?.total || 0,
            averageRating: data.averageRating,
            ratingDistribution: data.ratingDistribution,
          });
        }
      } catch (err) {
        console.error('Error loading reviews stats:', err);
      }
    };
    loadReviewsStats();
  }, [serviceId]);

  const isOwner = service?.isOwner;
  const canEdit = isOwner && roleName === ROLES.USER && service?.status === 'active' && service?.isActive !== false;
  const canDelete = isOwner && roleName === ROLES.USER && service?.status === 'active' && service?.isActive !== false;
  const canContract = !isOwner && roleName === ROLES.USER && service?.status === 'active';
  const canSendMessage = !isOwner && roleName === ROLES.USER && service?.status === 'active';
  const canViewOnly = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;

  // Determinar si se debe mostrar "Ver Cotización" (solo cuando está en estado 'quoted')
  const activeHiring = service?.serviceHiring;
  const isQuotedStatus = activeHiring?.status?.code === 'quoted';
  const showViewQuotation = Boolean(service?.hasActiveQuotation && isQuotedStatus);


  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditService = async (updatedData) => {
    try {
      await editService(serviceId, updatedData);
      setShowEditModal(false);
      
      // Recargar los datos del servicio
      await loadServiceDetail();
      
      setToast({
        type: 'success',
        message: 'Servicio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al editar servicio:', error);
      setToast({
        type: 'error',
        message: 'Error al actualizar el servicio. Inténtalo de nuevo.'
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async (reason) => {
    try {
      await removeService(serviceId, reason);
      setShowDeleteModal(false);
      setToast({
        type: 'success',
        message: 'Servicio eliminado exitosamente. Redirigiendo...'
      });
      
      // Redirigir inteligentemente según de dónde vino el usuario
      setTimeout(() => {
        // Verificar si hay historial de navegación
        if (window.history.length > 1) {
          // Intentar obtener la URL de referencia
          const referrer = document.referrer;
          const currentOrigin = window.location.origin;
          
          // Si viene de dentro de la aplicación, usar router.back()
          if (referrer && referrer.startsWith(currentOrigin)) {
            router.back();
          } else {
            // Si no hay referrer o viene de fuera, ir al perfil del usuario
            router.push(`/profile/${user?.id}`);
          }
        } else {
          // Si no hay historial, ir al perfil del usuario
          router.push(`/profile/${user?.id}`);
        }
      }, 1500);
    } catch (error) {
      setShowDeleteModal(false);
      
      // Manejar específicamente el error 409 (conflicto por contratos activos)
      if (error.statusCode === 409) {
        setShowConflictModal(true);
      } else {
        console.error('Error al eliminar servicio:', error);
        setToast({
          type: 'error',
          message: error.message || 'Error al eliminar el servicio. Inténtalo de nuevo.'
        });
      }
    }
  };

  const handleViewContracts = () => {
    setShowConflictModal(false);
    router.push(`/services/my-services/${service.id}/requests`);
  };

  const handleQuote = () => {
    // Lógica de botones dinámicos según estado del servicio
    if (service?.hasPendingQuotation) {
      // Cancelar solicitud existente
      handleCancelQuotation();
    } else if (showViewQuotation) {
      // Solo abrir detalle si está en estado 'quoted'
      handleActiveQuotation();
    } else {
      // En todos los demás casos: crear nueva cotización/solicitud
      // Esto incluye: sin cotización, en reclamo, aceptada, rechazada, cancelada, negotiating, etc.
      setShowHiringModal(true);
    }
  };

  const handleCancelQuotation = async () => {
    try {
      // Verificar que existe el ID de la cotización pendiente
      if (service?.pendingQuotationId) {
        // Crear objeto con la información necesaria para el modal
        const pendingHiring = {
          id: service.pendingQuotationId,
          service: service,
          status: { code: 'pending', name: 'Pendiente' },
          availableActions: ['cancel']
        };
        setPendingHiring(pendingHiring);
        setShowCancelModal(true);
      } else {
        setToast({
          type: 'error',
          message: 'No se encontró una solicitud pendiente para cancelar'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error al abrir las opciones de la solicitud'
      });
    }
  };

  const handleActiveQuotation = async () => {
    try {
      // Usar los datos de service.serviceHiring si están presentes para mostrar el detalle completo
      const sh = service?.serviceHiring;
      if (sh && service?.activeQuotationId === sh.id) {
        // Enriquecer el hiring con el service y owner para el modal
        const enriched = {
          ...sh,
          service: sh.service ? { ...sh.service } : { id: service.id, title: service.title, description: service.description, price: service.price, timeUnit: service.timeUnit, images: service.images },
          owner: service.owner,
        };
        // Si la modalidad de pago es por entregables y el backend devolvió los entregables
        // (vienen en el detalle del servicio como propiedad de nivel superior),
        // agregarlos al objeto que consume el modal y normalizar tipos numéricos.
        if (
          enriched?.paymentModality?.code === 'by_deliverables' &&
          Array.isArray(service?.deliverables) &&
          service.deliverables.length > 0
        ) {
          enriched.deliverables = service.deliverables.map((d, idx) => ({
            ...d,
            // Normalizar el precio a número para que toLocaleString funcione correctamente
            price: typeof d.price === 'string' ? parseFloat(d.price) : d.price,
            // Asegurar un orderIndex consistente si no viene
            orderIndex: typeof d.orderIndex === 'number' ? d.orderIndex : idx + 1,
          }));
        }
        // Acciones por defecto según estado (el modal ocultará si está vencida)
        const code = enriched.status?.code;
        if (!enriched.availableActions) {
          if (code === 'quoted') {
            enriched.availableActions = ['accept', 'reject', 'negotiate', 'cancel'];
          } else if (code === 'negotiating') {
            // En negociación: permitir aceptar, rechazar y cancelar
            enriched.availableActions = ['accept', 'reject', 'cancel'];
          } else if (code === 'accepted') {
            enriched.availableActions = ['cancel'];
          } else if (code === 'pending') {
            enriched.availableActions = ['cancel'];
          } else {
            enriched.availableActions = [];
          }
        }
        setQuotationHiring(enriched);
        setShowQuotationModal(true);
      } else if (service?.activeQuotationId) {
        // Fallback mínimo si no vino serviceHiring completo
        const minimal = {
          id: service.activeQuotationId,
          service: { id: service.id, title: service.title, description: service.description, price: service.price, timeUnit: service.timeUnit, images: service.images },
          owner: service.owner,
          status: { code: 'quoted', name: 'Cotizado' },
          availableActions: ['accept', 'reject', 'negotiate', 'cancel']
        };
        setQuotationHiring(minimal);
        setShowQuotationModal(true);
      } else {
        setToast({ type: 'error', message: 'No se encontró una cotización activa' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error al abrir el detalle de la cotización' });
    }
  };

  const handleHiringSuccess = (message) => {
    setToast({
      type: 'success',
      message: message,
      isVisible: true
    });
    loadServiceDetail(serviceId); // Recargar para actualizar estado
  };

  const handleDirectCancel = async () => {
    try {
      setShowCancelModal(false);
      await cancelHiring(pendingHiring?.id);
      setToast({
        type: 'success',
        message: 'Solicitud cancelada exitosamente'
      });
      loadServiceDetail(serviceId); // Recargar para actualizar estado
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Error al cancelar la solicitud'
      });
    }
  };

  // Envío de mensaje con contexto del servicio
  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      // Crear mensaje con contexto del servicio igual que proyecto
      const serviceLink = `${window.location.origin}/services/${serviceId}`;
      const contextMessage = `🛠️ Consulta sobre el servicio: "${service.title}"

🔗 Ver servicio: ${serviceLink}

💬 Mensaje:
${messageText.trim()}`;
      
      await sendTextMessageTo({ 
        receiverId: service.owner.id, 
        content: contextMessage 
      });
      
      setMessageSent(true);
      setMessageText("");
      setShowEmojis(false);
      
      // Actualizar conversaciones y contador
      await loadConversations();
      await refreshUnreadCount();
      
      // No resetear messageSent - permanece hasta recargar página como en proyectos
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChat = () => {
    // Aquí iría la lógica para iniciar chat
    router.push(`/messaging?userId=${service.owner.id}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Error al cargar el servicio
                </h2>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => router.back()} variant="outline">
                  Volver atrás
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Servicio no encontrado
                </h2>
                <p className="text-gray-500 mb-4">
                  El servicio que buscas no existe o no tienes permisos para verlo.
                </p>
                <Button onClick={() => router.push('/services')} variant="primary">
                  Ver todos los servicios
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
    <div className="relative min-h-screen w-full bg-[#f3f9f8] overflow-hidden flex flex-col">
      {/* Background Image */}
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
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* El botón de reporte se renderiza dentro de la tarjeta más abajo */}
  

      {/* Contenido principal */}
      <main className="flex-1 pt-20 pb-8 relative z-10">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs y navegación */}
          <div className="flex items-center gap-4 mb-6">
            <nav className="text-sm text-gray-500">
              <Link href="/services" className="hover:text-conexia-green">
                Servicios
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{service.title}</span>
            </nav>
          </div>

          {/* Contenido del servicio */}
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden relative">
            <div className="p-6 lg:p-8">
              {/* Botón de más opciones - Desktop: esquina del card; Mobile: junto al título */}
              {user && roleName === ROLES.USER && !isOwner && service?.status === 'active' && service?.isActive !== false && (
                <>
                  {/* Desktop */}
                  <div className="absolute top-4 right-6 md:right-8 z-30 hidden md:block">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                      onClick={() => setMenuOpen(!menuOpen)}
                      aria-label="Más opciones"
                      type="button"
                    >
                      <MoreVertical size={22} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
                        <button
                          className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                          onClick={() => {
                            setMenuOpen(false);
                            setShowReportModal(true);
                          }}
                          type="button"
                        >
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                              <circle cx="12" cy="16" r="1.2" fill="currentColor" />
                              <rect x="11.1" y="7" width="1.8" height="6" rx="0.9" fill="currentColor" />
                            </svg>
                            <span>Reportar servicio</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Menú de admins/moderadores: Ver reportes */}
              {user && (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) && (
                <div className="absolute top-4 right-6 md:right-8 z-30 hidden md:block">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Más opciones"
                    type="button"
                  >
                    <MoreVertical size={22} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
                      <button
                        className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                        onClick={() => {
                          setMenuOpen(false);
                          router.push(`/reports/service/${serviceId}`);
                        }}
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Ver reportes</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[420px] lg:min-h-[480px]">
                {/* Galería de imágenes */}
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <ServiceImageCarousel 
                      images={service.images} 
                      title={service.title} 
                      onImageClick={handleShowImageZoom}
                      className="h-full"
                    />
                  </div>
                </div>

                {/* Información del servicio */}
                <div className="space-y-4 flex flex-col h-full">
                  {/* Título y categoría */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words overflow-wrap-anywhere leading-tight flex-1 min-w-0">
                        {service.title}
                      </h1>
                      {/* Mobile three-dots - para dueño del servicio */}
                      {canEdit && (
                        <div className="relative ml-2 flex-shrink-0">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Más opciones"
                            type="button"
                          >
                            <MoreVertical size={22} />
                          </button>
                          {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-40">
                              <button
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b font-semibold text-conexia-green"
                                onClick={() => {
                                  setMenuOpen(false);
                                  handleEdit();
                                }}
                                type="button"
                              >
                                <FaEdit size={16} className="text-conexia-green" />
                                <span>Editar</span>
                              </button>
                              <button
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 font-semibold text-red-600"
                                onClick={() => {
                                  setMenuOpen(false);
                                  handleDelete();
                                }}
                                type="button"
                              >
                                <FaTrash size={16} className="text-red-600" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Mobile three-dots next to title - para usuarios que pueden reportar */}
                      {user && roleName === ROLES.USER && !isOwner && service?.status === 'active' && service?.isActive !== false && (
                        <div className="relative md:hidden ml-2 flex-shrink-0">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Más opciones"
                            type="button"
                          >
                            <MoreVertical size={22} />
                          </button>
                          {menuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40 md:hidden">
                              <button
                                className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                                onClick={() => {
                                  setMenuOpen(false);
                                  setShowReportModal(true);
                                }}
                                type="button"
                              >
                                <span className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
                                    <rect x="11.1" y="7" width="1.8" height="6" rx="0.9" fill="currentColor" />
                                  </svg>
                                  <span>Reportar servicio</span>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Mobile admin/moderator menu */}
                      {user && (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) && (
                        <div className="relative md:hidden ml-2 flex-shrink-0">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Más opciones"
                            type="button"
                          >
                            <MoreVertical size={22} />
                          </button>
                          {menuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40 md:hidden">
                              <button
                                className="w-full flex items-center justify-center px-6 py-3 gap-3 font-semibold border border-[#c6e3e4] bg-white text-conexia-green rounded shadow hover:bg-[#eef6f6] transition-colors"
                                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                                onClick={() => {
                                  setMenuOpen(false);
                                  router.push(`/reports/service/${serviceId}`);
                                }}
                                type="button"
                              >
                                <span className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-conexia-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Ver reportes</span>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 inline-flex items-center gap-1.5">
                        <FaTag size={12} />
                        {service.category?.name}
                      </span>
                    </div>
                    {/* Mostrar calificación y número de reseñas debajo de la categoría */}
                    {reviewsStats && reviewsStats.total > 0 && (
                      <button
                        onClick={() => {
                          const reviewsSection = document.getElementById('reviews-section');
                          if (reviewsSection) {
                            reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="flex items-center gap-1 mt-2 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-gray-900">
                          {reviewsStats.averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= Math.round(reviewsStats.averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({reviewsStats.total})
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="bg-conexia-green/5 p-4 rounded-lg">
                    <span className="text-3xl font-bold text-conexia-green">
                      {formatPrice(service.price)}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <FaClock size={14} />
                      <span className="text-sm">
                        {service.timeUnit ? `Precio por ${getUnitLabel(service.timeUnit)}` : 'Precio base'}
                      </span>
                    </div>
                  </div>

                  {/* Información del propietario */}
                  <div className={`bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-xl border ${canSendMessage ? 'flex-1' : ''}`}>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                      <FaUser size={14} className="text-conexia-green" />
                      Publicado por
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                        <Image
                          src={getProfileImageSrc()}
                          alt={`${service.owner?.firstName} ${service.owner?.lastName}`}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${service.owner?.id}`}
                          className="font-medium text-gray-900 hover:text-conexia-green transition-colors block truncate"
                        >
                          {service.owner?.firstName} {service.owner?.lastName}
                        </Link>
                      </div>
                    </div>
                    
                    {/* Interfaz de mensajería */}
                    {canSendMessage && (
                      <div className="mt-1 w-full">
                        {messageSent ? (
                          <div className="bg-[#f3f9f8] border border-conexia-green/30 rounded-lg p-4 shadow-sm min-h-[96px] flex items-center justify-center gap-3">
                            <IoCheckmarkCircleSharp size={22} className="text-green-500 flex-shrink-0" />
                            <span className="text-conexia-green font-semibold">
                              Mensaje enviado al creador del servicio
                            </span>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm" style={{boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}>
                            <label htmlFor="mensajeCreador" className="flex items-center gap-1 font-semibold text-conexia-green mb-3 text-[11px] md:text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5 text-conexia-green">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                              </svg>
                              <span className="truncate">¿Tienes una consulta sobre este servicio?</span>
                            </label>
                            <div className="flex flex-row items-center gap-2 w-full">
                              {/* Textarea con icono de emoji adentro - centrado verticalmente */}
                              <div className="relative flex-1">
                                <textarea
                                  id="mensajeCreador"
                                  placeholder="Escribe tu consulta..."
                                  className="w-full rounded-lg px-3 pr-12 py-2 bg-white border border-gray-300 focus:outline-none focus:border-gray-500 text-[11px] md:text-sm text-gray-800 transition-all duration-150 resize-none"
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  rows={2}
                                  maxLength={500}
                                  style={{minHeight: '34px'}}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if (messageText.trim()) handleSendMessage();
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className="absolute right-6 top-1/2 -translate-y-1/2 text-conexia-green/70 hover:text-conexia-green"
                                  title="Emoji"
                                  onClick={() => setShowEmojis(v => !v)}
                                >
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="#1e6e5c" strokeWidth="2"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="9" cy="10" r="1" fill="#1e6e5c"/>
                                    <circle cx="15" cy="10" r="1" fill="#1e6e5c"/>
                                  </svg>
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
                              {/* Botón enviar - en desktop muestra texto, en mobile solo icono */}
                              <Button
                                type="button"
                                variant="neutral"
                                className={`text-[11px] md:text-sm px-2 md:px-4 py-2 rounded-lg transition-all duration-200 relative flex items-center justify-center ${
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
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fechas de publicación */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <FaCalendar size={12} />
                      <span>Publicado: {formatDate(service.createdAt)}</span>
                    </div>
                    {service.updatedAt !== service.createdAt && (
                      <div className="flex items-center gap-2">
                        <FaCalendar size={12} />
                        <span>Actualizado: {formatDate(service.updatedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Botón de cotización - extremo derecho en desktop, centrado en mobile */}
                  {canContract && (
                    <div className="flex justify-end md:justify-end justify-center w-full md:w-auto">
                      <Button
                        variant={
                          service?.hasPendingQuotation
                            ? 'danger'
                            : 'primary'
                        }
                        onClick={handleQuote}
                        disabled={false}
                        className="flex items-center justify-center gap-2 !px-6 !py-3 w-full md:w-auto"
                      >
                        <FaHandshake size={16} />
                        {service?.hasPendingQuotation
                          ? 'Cancelar Solicitud'
                          : showViewQuotation
                            ? 'Ver Cotización'
                            : 'Solicitar Cotización'}
                      </Button>
                    </div>
                  )}

                  {canViewOnly && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-700">
                        Como {roleName.toLowerCase()}, puedes ver este servicio pero no editarlo ni contratarlo.
                      </p>
                    </div>
                  )}
                </div> {/* Este cierra el div de space-y-6 de la segunda columna */}
              </div> {/* Este cierra la grid */}

              {/* Descripción completa */}
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Descripción del servicio
                </h2>
                <div className="w-full">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words word-wrap overflow-wrap-anywhere">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Sección de reseñas */}
              <div id="reviews-section" className="mt-8 pt-8 border-t scroll-mt-20">
                <ServiceReviewsSection serviceId={serviceId} />
              </div>

              {/* Navegación y Acciones */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-row items-center justify-start w-full gap-2">
                  {/* Botón volver a la izquierda */}
                  <div className="flex-shrink-0">
                    <BackButton
                      onClick={() => {
                        const from = searchParams.get('from');
                        const fromReportsServiceId = searchParams.get('fromReportsServiceId');
                        if (from === 'reports-service' && fromReportsServiceId) {
                          router.push(`/reports/service/${fromReportsServiceId}`);
                        } else if (from === 'reports') {
                          const f = searchParams.get('filter');
                          const o = searchParams.get('order');
                          const p = searchParams.get('page');
                          const qs = new URLSearchParams();
                          if (f) qs.set('filter', f);
                          if (o) qs.set('order', o);
                          if (p) qs.set('page', p);
                          const suffix = qs.toString();
                          router.push(`/reports${suffix ? `?${suffix}` : ''}`);
                        } else {
                          router.back();
                        }
                      }}
                      text="Volver"
                    />
                  </div>
                </div>
              </div>
            </div> 
          </div> 
        </div> 
      </main> 

      {/* Modal de edición */}
      <ServiceEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleEditService}
        service={service}
        loading={isEditing}
      />

      {/* Modal de eliminación */}
      <ServiceDeactivateModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        serviceTitle={service.title}
      />

      {/* Modal de conflicto por contratos activos */}
      <ServiceDeleteConflictModal
        open={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        serviceTitle={service.title}
        onViewContracts={handleViewContracts}
      />

      {/* Modal de contratación/cotización */}
      <ServiceHiringModal
        service={service}
        isOpen={showHiringModal}
        onClose={() => setShowHiringModal(false)}
        onSuccess={handleHiringSuccess}
      />

      {/* Modal de detalle de cotización (para cotización activa o vencida) */}
      <QuotationModal
        hiring={quotationHiring}
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        onSuccess={handleHiringSuccess}
        onError={(msg) => setToast({ type: 'error', message: msg || 'Ocurrió un error' })}
      />

      {/* Modal de acciones de contratación (cancelar solicitud) */}
      <ServiceHiringActionsModal
        hiring={pendingHiring}
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        onSuccess={handleHiringSuccess}
      />

      {/* Modal de cancelación directa */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTrash size={20} className="text-orange-500" />
                Confirmar Acción
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Cancelar Solicitud
                </h4>
                <p className="text-gray-600 text-sm">
                  Al cancelar esta solicitud, se eliminará permanentemente y no podrás recuperarla. Esta acción no se puede deshacer.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCancelModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDirectCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Sí, Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reporte de servicio */}
      <ReportServiceModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        loading={reportLoading}
        onSubmit={async ({ reason, description, otherText }) => {
          setReportLoading(true);
          // Cerrar modal inmediatamente (como en proyecto)
          setShowReportModal(false);
          try {
            await createServiceReport({
              serviceId: service.id,
              reason, // Ya coincide con backend
              otherReason: reason === 'Otro' ? otherText : undefined,
              description
            });
            setToast({ type: 'success', message: 'Servicio reportado con éxito.', isVisible: true });
            setAlreadyReportedService(true);
          } catch (err) {
            const msg = err?.message || '';
            const alreadyRegex = /already\s+been\s+reported|conflict|ya\s+reportado/i;
            if (alreadyRegex.test(msg)) {
              setToast({ type: 'warning', message: 'Ya has reportado este servicio.', isVisible: true });
              setAlreadyReportedService(true);
            } else {
              setToast({ type: 'error', message: 'Error al reportar el servicio. Inténtalo más tarde.', isVisible: true });
            }
          } finally {
            setReportLoading(false);
          }
        }}
      />

      {/* Sin modal adicional para 'ya reportado': se usa toast y se oculta la acción */}

      {/* Toast de notificaciones */}
      <Toast
        type={toast?.type || 'info'}
        message={toast?.message || ''}
        isVisible={!!toast}
        onClose={() => setToast(null)}
        duration={toast?.type === 'success' ? 3000 : 5000}
        position="top-center"
      />

    </div>

    {/* Modal de zoom de imagen - fuera del contenedor principal */}
    <ImageZoomModalServiceDetail
      open={showImageZoom}
      onClose={handleCloseImageZoom}
      images={service?.images || []}
      initialIndex={zoomIndex}
    />
    </>
  );
}

export default ServiceDetail;
