import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useServiceDetail } from '@/hooks/services';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { getUnitLabel } from '@/utils/timeUnit';
import { FaClock, FaUser, FaEdit, FaTrash, FaHandshake, FaComments, FaArrowLeft, FaTag, FaCalendar, FaPaperPlane } from 'react-icons/fa';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { config } from '@/config';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Navbar from '@/components/navbar/Navbar';
import ServiceImageCarousel from './ServiceImageCarousel';
import ServiceDeactivateModal from './ServiceDeactivateModal';
import ServiceDeleteConflictModal from '@/components/ui/ServiceDeleteConflictModal';
import ServiceEditModal from './ServiceEditModal';
import ServiceHiringModal from './ServiceHiringModal';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { useChatMessages } from '@/hooks/messaging/useChatMessages';
import { useDeleteService } from '@/hooks/services/useDeleteService';
import { useEditService } from '@/hooks/services/useEditService';
import Toast from '@/components/ui/Toast';
import EmojiPicker from 'emoji-picker-react';

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
  const [imageError, setImageError] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Messaging state
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Messaging hooks
  const { loadConversations, refreshUnreadCount } = useMessaging();
  const { sendTextMessageTo } = useChatMessages();

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

  const isOwner = service?.isOwner;
  const canEdit = isOwner && roleName === ROLES.USER;
  const canDelete = canEdit;
  const canContract = !isOwner && roleName === ROLES.USER && service?.status === 'active';
  const canSendMessage = !isOwner && roleName === ROLES.USER && service?.status === 'active';
  const canViewOnly = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;



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
      
      // Redirigir al perfil del usuario después de un breve delay
      setTimeout(() => {
        router.push(`/profile/${user?.id}`);
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
    router.push('/services/my-hirings?tab=requests');
  };

  const handleQuote = () => {
    // Lógica de botones dinámicos según estado del servicio
    if (service?.hasPendingQuotation) {
      // Cancelar solicitud existente
      handleCancelQuotation();
    } else if (service?.hasActiveQuotation) {
      // No hacer nada, botón estará deshabilitado
      return;
    } else {
      // Crear nueva cotización/solicitud
      setShowHiringModal(true);
    }
  };

  const handleCancelQuotation = async () => {
    try {
      // TODO: Implementar cancelación de cotización
      alert('Funcionalidad de cancelar cotización en desarrollo');
      // await cancelQuotation(service.id);
      // loadServiceDetail(serviceId); // Recargar datos
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error al cancelar la solicitud',
        isVisible: true
      });
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
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Galería de imágenes */}
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg">
                    {service.images && service.images.length > 0 ? (
                      <ServiceImageCarousel images={service.images} title={service.title} />
                    ) : (
                      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-50">
                        <Image
                          src="/default_project.jpeg"
                          alt={service.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del servicio */}
                <div className="space-y-4 flex flex-col h-full">
                  {/* Título y categoría */}
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 inline-flex items-center gap-1.5">
                        <FaTag size={12} />
                        {service.category?.name}
                      </span>
                    </div>
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
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-xl border flex-1">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                      <FaUser size={14} className="text-conexia-green" />
                      Publicado por
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
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
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
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
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Navegación y Acciones */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Breadcrumbs y botón volver */}
                  <div className="flex items-center gap-4">
                    <BackButton
                      onClick={() => router.back()}
                      text="Volver"
                    />
                    
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    {canEdit && (
                      <>
                        <Button
                          variant="primary"
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 text-sm"
                        >
                          <FaEdit size={14} />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={handleDelete}
                          className="flex items-center gap-2 px-4 py-2 text-sm"
                        >
                          <FaTrash size={14} />
                          Eliminar
                        </Button>
                      </>
                    )}
                    {canContract && (
                      <Button
                        variant={service?.hasPendingQuotation ? "danger" : service?.hasActiveQuotation ? "secondary" : "neutral"}
                        onClick={handleQuote}
                        disabled={service?.hasActiveQuotation}
                        className="flex items-center gap-2 px-4 py-2 text-sm"
                      >
                        <FaHandshake size={14} />
                        {service?.hasPendingQuotation 
                          ? 'Cancelar Solicitud' 
                          : service?.hasActiveQuotation 
                            ? 'Cotización en curso' 
                            : 'Cotizar'
                        }
                      </Button>
                    )}
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
  );
}
export default ServiceDetail;
