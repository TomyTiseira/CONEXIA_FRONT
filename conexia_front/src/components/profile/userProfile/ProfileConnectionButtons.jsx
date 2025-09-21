import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSendConnectionRequest } from '@/hooks/connections/useSendConnectionRequest';
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';
import { useCancelConnectionRequest } from '@/hooks/connections/useCancelConnectionRequest';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import { useFindConnection } from '@/hooks/connections/useFindConnection';
import { HiOutlinePlus } from 'react-icons/hi';
import { Check, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { FaRegClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';
import { useUserStore } from '@/store/userStore';
import { useRole } from '@/hooks/useRole';

export default function ProfileConnectionButtons({ profile, id, isOwner, receiverId}) {

  // Obtener roleName y roleId del store global (igual que Navbar)
  const { roleName, roleId } = useUserStore();
  // Fallback: obtener user de AuthContext (por si acaso)
  const { user: currentUser } = useAuth();
  // Si no hay roleName, usar hook useRole
  const { role } = useRole(roleId || currentUser?.roleId);
  const effectiveRole = roleName || role;
  const isAdmin = effectiveRole === ROLES.ADMIN;
  const isModerator = effectiveRole === ROLES.MODERATOR;

  // Importante: no retornar aún. Mantener el orden de hooks estable entre renders.

  const { sendRequest, loading: sendLoading } = useSendConnectionRequest();
  const { acceptRequest, loading: acceptLoading } = useAcceptConnectionRequest();
  const { cancelRequest, loading: cancelLoading } = useCancelConnectionRequest();
  const { cancelRequest: deleteContact, loading: deleteLoading } = useCancelConnectionRequest(); // Hook separado para eliminar
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();
  const { refreshRequests } = useConnectionRequests();
  // Buscar conexión siempre para usuarios normales (preferimos estado del servidor sobre el del perfil)
  const shouldQueryConnection = (!isOwner && !isAdmin && !isModerator) ? receiverId : null;
  const { connection: connectionFromHook, refreshConnection } = useFindConnection(shouldQueryConnection);
  
  // Estados compartidos
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Nuevo estado para evitar duplicados
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null); // Ref separado para mobile
  const desktopDropdownRef = useRef(null); // Ref separado para desktop
  const deletingRef = useRef(false); // Referencia adicional para prevenir llamadas duplicadas

  // NUEVO: datos del usuario para el chat y acción de abrir (via evento o navegación)
  const router = useRouter();
  const chatUser = {
    id: receiverId,
    profilePicture: profile?.profile?.profilePicture || null,
    userName: `${(profile?.profile?.name || '').trim().split(/\s+/)[0] || ''} ${(profile?.profile?.lastName || '').trim().split(/\s+/)[0] || ''}`.trim(),
    conversationId: profile?.profile?.conversationId || null,
  };
  const openChat = () => {
    // Cerrar el dropdown si está abierto
    setDropdownOpen(false);
    // Mobile: redirigir a la página de conversación usando conversationId (fallback a /u/[userId])
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const convId = chatUser.conversationId;
        if (convId) {
          router.push(`/messaging/${convId}`);
        } else {
          router.push(`/messaging/u/${chatUser.id}`);
        }
        return;
      }
    } catch {}

    // Desktop: pedirle al widget que abra el chat al costado (no abre el modal principal)
    try {
      window.dispatchEvent(new CustomEvent('open-chat-with', {
        detail: { user: chatUser } // no enviamos openMain para no abrir el modal
      }));
    } catch {}
  };

  // Si tenemos datos de conexión del perfil, los usamos primero, sino usamos los del hook
  const [localConnection, setLocalConnection] = useState(null);
  
  useEffect(() => {
    // Prioridad: 1) conexión del hook (estado más fresco), 2) conexión del perfil como fallback
    const connectionData = connectionFromHook || profile.profile?.connectionData || null;
    setLocalConnection(connectionData);
  }, [profile.profile?.connectionData, connectionFromHook]);
  
  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target) &&
          desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const connection = localConnection;
  
  // Función común para eliminar contacto (usa el mismo endpoint que cancelar)
  const handleDeleteContact = useCallback(async () => {
    if (!connection || isDeleting || deletingRef.current) return; // Triple protección contra duplicados
    
    setIsDeleting(true);
    deletingRef.current = true;
    try {
      // Usar el hook de cancelar normal ya que es el mismo endpoint
      await cancelRequest(connection.id);
      // Refrescar estado global/local desde el servidor y limpiar estados locales
      await refreshRequests();
      await refreshConnection();
      setLocalConnection(null);
      setSent(false);
      setDropdownOpen(false);
      
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
    } finally {
      setShowDeleteModal(false);
      setIsDeleting(false);
      deletingRef.current = false;
    }
  }, [connection, isDeleting, cancelRequest, refreshRequests, refreshConnection]);

  // Ocultar completamente para owner/admin/moderador, pero después de declarar TODOS los hooks anteriores
  if (isOwner || isAdmin || isModerator) return null;

  // Amigo
  if (connection?.state === 'accepted') {
    // No mostrar nada para admin o moderador
    if (isAdmin || isModerator) return null;
    return (
      <>
        {/* Mobile: centrado debajo del nombre (pila: Conectado + Enviar mensaje) */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden gap-2">
          <div className="relative flex justify-center" ref={mobileDropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-full border border-[#e0f0f0] px-4 h-10 text-sm w-56 whitespace-nowrap"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Check className="w-5 h-5 mr-2 text-conexia-green" />
              Conectado
              <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {dropdownOpen && (
              <div className="absolute z-50 top-full mt-2 left-0 w-56 bg-transparent border-0 shadow-none flex justify-center">
                <button 
                  className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 text-red-600" />
                  <span className="truncate">Eliminar contacto</span>
                </button>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 h-10 text-sm font-semibold w-56 whitespace-nowrap rounded-full"
            onClick={openChat}
            style={{lineHeight: '1.2'}}>
            <Send className="w-4 h-4 mr-2" />
            <span className="truncate">Enviar mensaje</span>
          </Button>
        </div>
        {/* Desktop: extremo derecho, apilados verticalmente (Conectado arriba, Enviar abajo) */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 flex-col items-end gap-2">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-full border border-[#e0f0f0] px-4 text-sm min-w-[190px] max-w-[190px] h-10"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Check className="w-5 h-5 mr-2 text-conexia-green" />
              Conectado
              <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 z-50 top-full mt-2 w-full bg-transparent border-0 shadow-none">
                <button 
                  className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (isDeleting || showDeleteModal) return; // No abrir si ya está procesando o modal abierto
                    setDropdownOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                  Eliminar contacto
                </button>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 text-sm min-w-[190px] max-w-[190px] h-10 rounded-full shadow-none border-none"
            onClick={openChat}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar mensaje
          </Button>
        </div>
        {/* Modal único para eliminar contacto */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteContact}
          title="Eliminar contacto"
          message="¿Estás seguro que deseas eliminar este contacto?"
          confirmButtonText="Confirmar"
          cancelButtonText="Cancelar"
          isLoading={deleteLoading || isDeleting}
        />
      </>
    );
  }

    // No amigo y sin solicitud
    if (!connection) {
      if (isAdmin || isModerator) return null;
    const handleSend = async () => {
      setSent(true);
      try {
        const response = await sendRequest(receiverId);
        // Si el backend devuelve la solicitud en response.data, guardar el objeto completo
        if (response && response.data && response.data.id) {
          setLocalConnection(response.data);
        }
        // Actualizar el contexto después de enviar la solicitud
        await refreshRequests();
        // Actualizar la conexión local después de enviar la solicitud
        await refreshConnection();
      } catch {
        setSent(false);
      }
    };

    const handleCancel = async () => {
      try {
        // Primero necesitamos obtener el ID de la solicitud pendiente
        const result = await refreshRequests();
        const pendingRequest = result?.requests?.find(
          req => req.receiverId === receiverId && req.senderId === id
        );
        if (pendingRequest) {
          await cancelRequest(pendingRequest.id);
          setSent(false);
          await refreshRequests();
          await refreshConnection(); // Actualizar la conexión local
          setShowCancelModal(false); // Cerrar el modal después de cancelar
        }
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
      }
    };
    
    return (
      <>
        {/* Mobile: primero Conectar/Pendiente arriba y luego Enviar mensaje (mismo tamaño) */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden gap-2">
          {!sent ? (
            <Button
              variant="connect"
              className="flex items-center justify-center font-semibold rounded-full border border-[#e0f0f0] transition-colors focus:outline-none shadow-sm px-4 h-10 text-sm w-56 whitespace-nowrap gap-2"
              onClick={handleSend}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-transparent">
                <HiOutlinePlus className="w-3.5 h-3.5 text-white stroke-[3]" />
              </span>
              <span>Conectar</span>
            </Button>
          ) : (
            <div className="relative flex justify-center" ref={mobileDropdownRef}>
              <Button
                variant="informative"
                className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-full border border-[#e0f0f0] px-4 h-10 text-sm w-56 whitespace-nowrap"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Pendiente</span>
                <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </Button>
              {dropdownOpen && (
                <div className="absolute z-20 mt-2 left-0 w-56 bg-transparent border-0 shadow-none flex justify-center">
                  <button 
                    className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCancelModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2 text-red-600" />
                    <span className="truncate">Cancelar solicitud</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 h-10 text-sm font-semibold w-56 whitespace-nowrap rounded-full"
            onClick={openChat}
            style={{lineHeight: '1.2'}}
          >
            <Send className="w-4 h-4 mr-2" />
            <span className="truncate">Enviar mensaje</span>
          </Button>
        </div>
        
        {/* Desktop: extremo derecho, apilados verticalmente (Conectar/Pendiente arriba, Enviar abajo) */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 flex-col items-end gap-2">
          {!sent ? (
            <Button
              variant="connect"
              className="flex items-center justify-center rounded-full border border-[#e0f0f0] transition-colors focus:outline-none shadow-sm px-4 text-sm min-w-[190px] max-w-[190px] h-10 gap-2"
              onClick={handleSend}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-transparent">
                <HiOutlinePlus className="w-3.5 h-3.5 text-white stroke-[3]" />
              </span>
              <span>Conectar</span>
            </Button>
          ) : (
            <div className="relative flex items-center h-10" ref={desktopDropdownRef}>
              <Button
                variant="informative"
                className="flex items-center justify-center px-4 text-sm min-w-[190px] max-w-[190px] h-10 rounded-full"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Pendiente</span>
                <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 z-20 mt-3 w-full bg-transparent border-0 shadow-none">
                  <button 
                    className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCancelModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                    Cancelar solicitud
                  </button>
                </div>
              )}
            </div>
          )}
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 text-sm min-w-[190px] max-w-[190px] h-10 rounded-full"
            onClick={openChat}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar mensaje
          </Button>
        </div>
        
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          title="Cancelar solicitud"
          message="¿Estás seguro que deseas cancelar esta solicitud de conexión?"
          confirmButtonText="Confirmar"
          cancelButtonText="Cancelar"
          isLoading={cancelLoading}
        />
      </>
    );
  }


  // Pendiente de que me acepte (yo envié la solicitud)
  if (connection.state === 'pending' && connection.senderId === id) {
    if (isAdmin || isModerator) return null;

    const handleCancel = async () => {
      try {
        await cancelRequest(connection.id);
        await refreshRequests(); // Actualizamos el contexto para reflejar el cambio
        await refreshConnection(); // Actualizamos la conexión local
        setSent(false); // Cambiamos el estado local
        setLocalConnection(null); // Reseteamos la conexión local
        setShowCancelModal(false); // Cerrar el modal después de cancelar
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
        // No cerrar el modal si hay error
      }
    };

    return (
      <>
        {/* Mobile: primero Pendiente arriba y luego Enviar mensaje */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden gap-2">
          <div className="relative flex justify-center" ref={mobileDropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-full border border-[#e0f0f0] px-4 h-10 text-sm w-56 whitespace-nowrap"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Pendiente</span>
                <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {dropdownOpen && (
              <div className="absolute z-50 top-full mt-2 w-56 bg-transparent border-0 shadow-none flex justify-center">
                <button
                  className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowCancelModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 h-10 text-sm font-semibold w-56 whitespace-nowrap rounded-full"
            onClick={openChat}
            style={{lineHeight: '1.2'}}>
            <Send className="w-4 h-4 mr-2" />
            <span className="truncate">Enviar mensaje</span>
          </Button>
        </div>
        {/* Desktop: extremo derecho, apilados verticalmente (Pendiente arriba, Enviar abajo) */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 flex-col items-end gap-2">
          <div className="relative flex items-center h-10">
            <Button
              variant="informative"
              className="flex items-center justify-center px-4 text-sm min-w-[190px] max-w-[190px] h-10 rounded-full"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Pendiente</span>
                <ChevronUp className={`w-4 h-4 ml-2 text-conexia-green transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {dropdownOpen && (
              <div ref={desktopDropdownRef} className="absolute right-0 z-50 top-full mt-2 w-full bg-transparent border-0 shadow-none">
                <button
                  className="w-full h-10 flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowCancelModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 text-sm min-w-[190px] max-w-[190px] h-10 rounded-full"
            onClick={openChat}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar mensaje
          </Button>
        </div>
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          title="Cancelar solicitud"
          message="¿Estás seguro que deseas cancelar esta solicitud de conexión?"
          confirmButtonText="Confirmar"
          cancelButtonText="Cancelar"
          isLoading={cancelLoading}
        />
      </>
    );
  }

  // Pendiente de que yo acepte (otro usuario me envió la solicitud)
  if (connection.state === 'pending' && connection.senderId !== id) {
    if (isAdmin || isModerator) return null;
    const handleAccept = async () => {
      try {
        await acceptRequest(connection.id);
        await refreshRequests(); // Actualizamos el contexto para reflejar el cambio
        await refreshConnection(); // Actualizamos la conexión local
        // Actualizamos la conexión en el estado local
        const updatedConnection = { ...connection, state: 'accepted' };
        setLocalConnection(updatedConnection);
        setShowAcceptModal(false); // Cerrar el modal después de aceptar
      } catch (error) {
        console.error('Error al aceptar solicitud:', error);
      }
    };

    const handleReject = async () => {
      try {
        await rejectRequest(connection.id);
        await refreshRequests(); // Actualizamos el contexto para reflejar el cambio
        await refreshConnection(); // Actualizamos la conexión local
        setLocalConnection(null); // Reseteamos la conexión local
        setShowRejectModal(false); // Cerrar el modal después de rechazar
      } catch (error) {
        console.error('Error al rechazar solicitud:', error);
      }
    };

    return (
      <>
        {/* Mobile: primero Enviar mensaje, luego Aceptar y Rechazar, todos más chicos y alineados */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden gap-2">
          <Button
            variant="primary"
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold w-56 whitespace-nowrap"
            onClick={openChat}
            style={{lineHeight: '1.2'}}
          >
            <Send className="w-4 h-4 mr-2" />
            <span className="truncate">Enviar mensaje</span>
          </Button>
          <div className="flex gap-2 w-56 justify-center">
            <Button
              variant="neutral"
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold w-1/2 whitespace-nowrap"
              onClick={() => setShowAcceptModal(true)}
              disabled={acceptLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Aceptar
            </Button>
            <Button
              variant="cancel"
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold w-1/2 whitespace-nowrap"
              onClick={() => setShowRejectModal(true)}
              disabled={rejectLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
        </div>

        <ConfirmModal
          isOpen={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          onConfirm={handleAccept}
          title="Aceptar solicitud"
          message="¿Estás seguro que deseas aceptar esta solicitud de conexión?"
          confirmButtonText="Aceptar"
          cancelButtonText="Cancelar"
          isLoading={acceptLoading}
        />

        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          title="Rechazar solicitud"
          message="¿Estás seguro que deseas rechazar esta solicitud de conexión?"
          confirmButtonText="Rechazar"
          cancelButtonText="Cancelar"
          isLoading={rejectLoading}
        />

      </>
    );
  }


  // Si no hay ninguna condición que se cumpla, no mostramos nada
  return (
    <>
      {/* Modal único para eliminar contacto - disponible globalmente */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteContact}
        title="Eliminar contacto"
        message="¿Estás seguro que deseas eliminar este contacto?"
        confirmButtonText="Confirmar"
        cancelButtonText="Cancelar"
        isLoading={isDeleting}
      />

      {/* NUEVO: panel de chat flotante (fallback) */}
      {chatOpen && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-50 flex sm:hidden justify-center">
            <ChatFloatingPanel user={chatUser} onClose={() => setChatOpen(false)} />
          </div>
          <div className="fixed right-6 bottom-0 z-50 hidden sm:flex">
            <ChatFloatingPanel user={chatUser} onClose={() => setChatOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
