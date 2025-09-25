import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { FaClock } from 'react-icons/fa';
import { config } from '@/config';
import ServiceImageCarousel from './ServiceImageCarousel';
import ServiceHiringModal from './ServiceHiringModal';
import Toast from '@/components/ui/Toast';

const ServiceCard = ({ service, showInactiveLabel = false, onServiceUpdated = null }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { roleName } = useUserStore();
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [toast, setToast] = useState(null);

  const getProfileImageSrc = () => {
    if (!service.owner?.profileImage) {
      return '/logo.png';
    }
    
    const imagePath = service.owner.profileImage;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Usar config.IMAGE_URL como en proyectos
    return `${config.IMAGE_URL}/${imagePath}`;
  };

  const getShortName = (fullName) => {
    if (!fullName) return 'Usuario';
    const names = fullName.split(' ').filter(name => name.length > 0);
    if (names.length === 0) return 'Usuario';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} ${names[1]}`;
    
    // Para 3 o más nombres, tomamos primer nombre y primer apellido
    if (names.length >= 3) {
      return `${names[0]} ${names[2]}`;
    }
    
    return `${names[0]} ${names[1]}`;
  };

  const isInactive = service.status === 'inactive' || service.status === 'deleted';
  
  // Verificar si puede contratar el servicio
  const canHire = isAuthenticated && roleName === ROLES.USER && service?.owner?.id !== user?.id && !isInactive;

  const handleHiringSuccess = (message) => {
    setToast({
      type: 'success',
      message: message,
      isVisible: true
    });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full items-stretch w-full hover:shadow-lg transition relative">
      {/* Etiquetas arriba de la imagen */}
      <div className="flex flex-row gap-2 mb-2 w-full justify-between items-center px-2" style={{ minHeight: '28px' }}>
        {showInactiveLabel && isInactive && (
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-gray-300 shadow select-none whitespace-nowrap" style={{lineHeight:'1.1'}}>
            ⏸ Inactivo
          </span>
        )}
        <div className="flex-1" />
      </div>

      {/* Imagen del servicio */}
      <div className="flex justify-center items-center mb-3 w-full">
        <ServiceImageCarousel
          images={service.images || []}
          title={service.title}
          size="small"
        />
      </div>

      {/* Título y dueño del servicio */}
      <div className="mb-2 flex flex-col items-center w-full">
        <h3 className="font-bold text-conexia-green text-base sm:text-lg leading-tight break-words text-center line-clamp-2 w-full">
          {service.title}
        </h3>
        
        {/* Dueño del servicio */}
        <div 
          className="flex items-center gap-2 mt-1 min-w-0 px-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
          onClick={() => router.push(`/profile/userProfile/${service.owner?.id}`)}
          style={{ maxWidth: '100%' }}
        >
          <div className="relative w-7 h-7">
            <Image
              src={getProfileImageSrc()}
              alt={service.owner ? `${service.owner.firstName} ${service.owner.lastName}` : 'Usuario'}
              fill
              className="object-cover rounded-full border bg-[#f3f9f8]"
              sizes="28px"
            />
          </div>
          <span className="text-conexia-green font-semibold text-sm whitespace-pre-line break-words truncate hover:underline max-w-[120px] md:max-w-[180px] lg:max-w-[220px]">
            {getShortName(`${service.owner?.firstName || ''} ${service.owner?.lastName || ''}`)}
          </span>
        </div>
      </div>

      {/* Badges - Categoría, precio y horas */}
      <div className="flex flex-col gap-1 mb-4 w-full px-2 min-h-[56px]">
        <div className="gap-1" style={{minHeight:'16px'}} />
        
        {/* Primera fila: Categoría y Horas estimadas */}
        <div className="flex gap-1 w-full">
          {service.category?.name && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium truncate flex-1 min-w-0 text-center">
              {service.category.name}
            </span>
          )}
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium truncate flex-1 min-w-0 text-center flex items-center justify-center gap-1">
            <FaClock size={10} />
            {service.estimatedHours}h
          </span>
        </div>
        
        {/* Segunda fila: Precio */}
        <div className="flex w-full">
          <span className="bg-conexia-green/10 text-conexia-green px-2 py-1 rounded text-sm font-bold truncate w-full text-center">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="w-full mt-auto px-2 space-y-2">
        {canHire && (
          <button
            className="bg-conexia-green text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-conexia-green/90 transition w-full"
            onClick={() => setShowHiringModal(true)}
          >
            Contratar
          </button>
        )}
        
        <button
          className={`${canHire ? 'bg-gray-500 hover:bg-gray-600' : 'bg-conexia-green hover:bg-conexia-green/90'} text-white px-4 py-2 rounded-md text-sm font-semibold transition w-full`}
          onClick={() => router.push(`/services/${service.id}`)}
        >
          Ver detalle
        </button>
      </div>

      {/* Modal de contratación */}
      <ServiceHiringModal
        service={service}
        isOpen={showHiringModal}
        onClose={() => setShowHiringModal(false)}
        onSuccess={handleHiringSuccess}
      />

      {/* Toast para notificaciones */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </div>
  );
};

export default ServiceCard;