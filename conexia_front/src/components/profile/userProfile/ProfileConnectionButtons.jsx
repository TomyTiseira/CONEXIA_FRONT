import React, { useState } from 'react';
import { useSendConnectionRequest } from '@/hooks/connections/useSendConnectionRequest';
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';
import { HiOutlinePlus } from 'react-icons/hi';
import { Check } from 'lucide-react';
import { FaRegClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';

export default function ProfileConnectionButtons({ profile, id, isOwner, receiverId}) {
  if (isOwner) return nul
  const { sendRequest, loading: sendLoading } = useSendConnectionRequest();
  const { acceptRequest, loading: acceptLoading } = useAcceptConnectionRequest();
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


  // Pendiente de que me acepte
  if (connection.state === 'pending' && connection.senderId === id) {
    return (
      <>
        {/* Mobile: centrado debajo del nombre */}
        <div className="flex justify-center w-full mt-2 sm:hidden">
          <button
            className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px] mx-auto"
            type="button"
            disabled
          >
            <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
            Pendiente
          </button>
        </div>
        {/* Desktop: extremo derecho y centrado verticalmente */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 mr-6">
          <button
            className="flex items-center justify-center bg-[#e0f0f0] text-conexia-green font-semibold rounded-lg border border-[#e0f0f0] px-4 py-2 text-sm w-full max-w-[160px]"
            type="button"
            disabled
          >
            <FaRegClock className="w-4 h-4 mr-2 text-conexia-green" />
            Pendiente
          </button>
        </div>
      </>
    );
  }

  return null;
}
