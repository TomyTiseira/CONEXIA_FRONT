import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSendConnectionRequest } from '@/hooks/connections/useSendConnectionRequest';
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';
import { useCancelConnectionRequest } from '@/hooks/connections/useCancelConnectionRequest';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import { useFindConnection } from '@/hooks/connections/useFindConnection';
import { HiOutlinePlus } from 'react-icons/hi';
import { Check, X, ChevronDown } from 'lucide-react';
import { FaRegClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ProfileConnectionButtons({ profile, id, isOwner, receiverId}) {
  if (isOwner) return null
  const { sendRequest, loading: sendLoading } = useSendConnectionRequest();
  const { acceptRequest, loading: acceptLoading } = useAcceptConnectionRequest();
  const { cancelRequest, loading: cancelLoading } = useCancelConnectionRequest();
  const { cancelRequest: deleteContact, loading: deleteLoading } = useCancelConnectionRequest(); // Hook separado para eliminar
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();
  const { refreshRequests } = useConnectionRequests();
  const { connection: connectionFromHook, refreshConnection } = useFindConnection(
    // Solo buscar conexión si no la tenemos en el perfil
    profile.profile?.connectionData ? null : receiverId
  );
  
  // Estados compartidos
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Nuevo estado para evitar duplicados
  const dropdownRef = useRef(null);
  const deletingRef = useRef(false); // Referencia adicional para prevenir llamadas duplicadas
  
  // Si tenemos datos de conexión del perfil, los usamos primero, sino usamos los del hook
  const [localConnection, setLocalConnection] = useState(null);
  
  useEffect(() => {
    // Prioridad: 1) conexión del perfil, 2) conexión del hook dedicado
    const connectionData = profile.profile?.connectionData || connectionFromHook;
    setLocalConnection(connectionData);
  }, [profile.profile?.connectionData, connectionFromHook]);
  
  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      
      // Solo actualizar el estado local
      setLocalConnection(null);
      
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
    } finally {
      setShowDeleteModal(false);
      setIsDeleting(false);
      deletingRef.current = false;
    }
  }, [connection, isDeleting, cancelRequest]);

  // Amigo
  if (connection?.state === 'accepted') {
    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex justify-center w-full mt-2 sm:hidden">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px] mx-auto"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Check className="w-5 h-5 mr-2 text-conexia-green" />
              Conectado
              <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
            </Button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => {
                    if (isDeleting || showDeleteModal) return; // No abrir si ya está procesando o modal abierto
                    setDropdownOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  Eliminar contacto
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Check className="w-5 h-5 mr-2 text-conexia-green" />
              Conectado
              <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => {
                    if (isDeleting || showDeleteModal) return; // No abrir si ya está procesando o modal abierto
                    setDropdownOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  Eliminar contacto
                </button>
              </div>
            )}
          </div>
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
    const handleSend = async () => {
      setSent(true);
      try {
        const response = await sendRequest(receiverId);
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
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex justify-center w-full mt-2 sm:hidden">
          {!sent ? (
            <Button
              variant="neutral"
              className="flex items-center justify-center px-4 py-2 text-sm w-full max-w-[160px] mx-auto"
              onClick={handleSend}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white mr-2 bg-transparent">
                <HiOutlinePlus className="w-4 h-4 text-white stroke-[2]" />
              </span>
              Conectar
            </Button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="informative"
                className="flex items-center justify-center px-4 py-2 text-sm min-w-[160px]"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Conectando</span>
                <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
              </Button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCancelModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar solicitud
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          {!sent ? (
            <Button
              variant="neutral"
              className="flex items-center justify-center px-4 py-2 text-sm w-full max-w-[160px]"
              onClick={handleSend}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white mr-2 bg-transparent">
                <HiOutlinePlus className="w-4 h-4 text-white stroke-[2]" />
              </span>
              Conectar
            </Button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="informative"
                className="flex items-center justify-center px-4 py-2 text-sm min-w-[160px]"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
                <span>Pendiente</span>
                <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCancelModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2 flex-shrink-0" />
                    Cancelar solicitud
                  </button>
                </div>
              )}
            </div>
          )}
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
    // Utilizamos el dropdown global que ya está declarado arriba
    // No declaramos otra referencia aquí

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
      }
    };

    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center px-4 py-2 text-sm min-w-[160px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
              <span>Pendiente</span>
              <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
            </Button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowCancelModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="informative"
              className="flex items-center justify-center px-4 py-2 text-sm min-w-[160px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
              <span>Pendiente</span>
              <ChevronDown className="w-4 h-4 ml-2 text-conexia-green" />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowCancelModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>
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
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden">
          <div className="flex gap-2">
            <Button
              variant="neutral"
              className="flex items-center justify-center px-4 py-2 text-sm"
              onClick={() => setShowAcceptModal(true)}
              disabled={acceptLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Aceptar solicitud
            </Button>
            <Button
              variant="cancel"
              className="flex items-center justify-center px-4 py-2 text-sm"
              onClick={() => setShowRejectModal(true)}
              disabled={rejectLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 gap-2">
          <Button
            variant="neutral"
            className="flex items-center justify-center px-4 py-2 text-sm"
            onClick={() => setShowAcceptModal(true)}
            disabled={acceptLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Aceptar solicitud
          </Button>
          <Button
            variant="cancel"
            className="flex items-center justify-center px-4 py-2 text-sm"
            onClick={() => setShowRejectModal(true)}
            disabled={rejectLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Rechazar
          </Button>
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
    </>
  );
}
