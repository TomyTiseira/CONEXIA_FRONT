import React, { useState } from 'react';
import { useSendConnectionRequest } from '@/hooks/connections/useSendConnectionRequest';
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';
import { useCancelConnectionRequest } from '@/hooks/connections/useCancelConnectionRequest';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import { HiOutlinePlus } from 'react-icons/hi';
import { Check, X } from 'lucide-react';
import { FaRegClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui';

export default function ProfileConnectionButtons({ profile, id, isOwner, receiverId}) {
  if (isOwner) return null
  const { sendRequest, loading: sendLoading } = useSendConnectionRequest();
  const { acceptRequest, loading: acceptLoading } = useAcceptConnectionRequest();
  const { cancelRequest, loading: cancelLoading } = useCancelConnectionRequest();
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const connection = profile.profile?.connectionData;

  // Amigo
  if (connection?.state === 'accepted') {
    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex justify-center w-full mt-2 sm:hidden">
          <button
            className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px] mx-auto cursor-default"
            type="button"
            disabled
          >
            <Check className="w-5 h-5 mr-2 text-conexia-green" />
            Conectado
          </button>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          <button
            className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px] cursor-default"
            type="button"
            disabled
          >
            <Check className="w-5 h-5 mr-2 text-conexia-green" />
            Conectado
          </button>
        </div>
      </>
    );
  }

  // No amigo y sin solicitud
  const [sent, setSent] = useState(false);
  if (!connection) {
    const handleSend = async () => {
      setSent(true);
      try {
        await sendRequest(receiverId);
      } catch {}
    };
    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex justify-center w-full mt-2 sm:hidden">
          <button
            className={`flex items-center justify-center font-semibold rounded-lg border px-4 py-2 text-sm w-full max-w-[160px] mx-auto ${sent ? 'bg-[#e0f0f0] text-conexia-green border-[#e0f0f0] cursor-default' : 'bg-[#367d7d] text-white border-[#e0f0f0] hover:bg-[#285c5c] transition-colors focus:outline-none shadow-sm'}`}
            type="button"
            onClick={sent ? undefined : handleSend}
            disabled={sent}
          >
            {sent
              ? <Check className="w-5 h-5 mr-2 text-conexia-green" />
              : <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white mr-2 bg-transparent">
                  <HiOutlinePlus className="w-4 h-4 text-white stroke-[2]" />
                </span>
            }
            {sent ? 'Enviada' : 'Conectar'}
          </button>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          <button
            className={`flex items-center justify-center font-semibold rounded-lg border px-4 py-2 text-sm w-full max-w-[160px] ${sent ? 'bg-[#e0f0f0] text-conexia-green border-[#e0f0f0] cursor-default' : 'bg-[#367d7d] text-white border-[#e0f0f0] hover:bg-[#285c5c] transition-colors focus:outline-none shadow-sm'}`}
            type="button"
            onClick={sent ? undefined : handleSend}
            disabled={sent}
          >
            {sent
              ? <Check className="w-5 h-5 mr-2 text-conexia-green" />
              : <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white mr-2 bg-transparent">
                  <HiOutlinePlus className="w-4 h-4 text-white stroke-[2]" />
                </span>
            }
            {sent ? 'Enviada' : 'Conectar'}
          </button>
        </div>
      </>
    );
  }


  // Pendiente de que me acepte (yo envié la solicitud)
  if (connection.state === 'pending' && connection.senderId === id) {
    const handleCancel = async () => {
      try {
        await cancelRequest(connection.id);
        window.location.reload(); // Recargamos para actualizar el estado
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
      }
    };

    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden">
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm"
              type="button"
              disabled
            >
              <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
              Pendiente
            </button>
            <button
              className="flex items-center justify-center bg-white text-red-500 font-semibold rounded-lg border border-red-500 px-4 py-2 text-sm"
              type="button"
              onClick={() => setShowCancelModal(true)}
            >
              <X className="w-4 h-4 mr-2 text-red-500" />
              Cancelar
            </button>
          </div>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 gap-2">
          <button
            className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm"
            type="button"
            disabled
          >
            <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
            Pendiente
          </button>
          <button
            className="flex items-center justify-center bg-white text-red-500 font-semibold rounded-lg border border-red-500 px-4 py-2 text-sm"
            type="button"
            onClick={() => setShowCancelModal(true)}
          >
            <X className="w-4 h-4 mr-2 text-red-500" />
            Cancelar
          </button>
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
        window.location.reload(); // Recargamos para actualizar el estado
      } catch (error) {
        console.error('Error al aceptar solicitud:', error);
      }
    };

    const handleReject = async () => {
      try {
        await rejectRequest(connection.id);
        window.location.reload(); // Recargamos para actualizar el estado
      } catch (error) {
        console.error('Error al rechazar solicitud:', error);
      }
    };

    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex flex-col items-center justify-center w-full mt-2 sm:hidden">
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center bg-[#367d7d] text-white font-semibold rounded-lg border border-[#367d7d] px-4 py-2 text-sm hover:bg-[#285c5c] transition-colors"
              type="button"
              onClick={() => setShowAcceptModal(true)}
              disabled={acceptLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Aceptar solicitud
            </button>
            <button
              className="flex items-center justify-center bg-white text-red-500 font-semibold rounded-lg border border-red-500 px-4 py-2 text-sm"
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={rejectLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </button>
          </div>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6 gap-2">
          <button
            className="flex items-center justify-center bg-[#367d7d] text-white font-semibold rounded-lg border border-[#367d7d] px-4 py-2 text-sm hover:bg-[#285c5c] transition-colors"
            type="button"
            onClick={() => setShowAcceptModal(true)}
            disabled={acceptLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Aceptar solicitud
          </button>
          <button
            className="flex items-center justify-center bg-white text-red-500 font-semibold rounded-lg border border-red-500 px-4 py-2 text-sm"
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={rejectLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Rechazar
          </button>
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

  return null;
}
