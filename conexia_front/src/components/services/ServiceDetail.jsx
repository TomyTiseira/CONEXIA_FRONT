import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useServiceDetail } from '@/hooks/services';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { FaClock, FaUser, FaEdit, FaTrash, FaHandshake, FaComments, FaArrowLeft, FaTag, FaCalendar } from 'react-icons/fa';
import { config } from '@/config';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';
import ServiceImageCarousel from './ServiceImageCarousel';

const ServiceDetail = ({ serviceId }) => {
  const router = useRouter();
  const { userId, roleName } = useUserStore();
  const { service, loading, error } = useServiceDetail(serviceId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageError, setImageError] = useState(false);

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
  const canViewOnly = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;

  const handleEdit = () => {
    router.push(`/services/${serviceId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Aquí iría la lógica para eliminar el servicio
      alert('Funcionalidad de eliminación en desarrollo');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
    }
  };

  const handleContract = () => {
    // Aquí iría la lógica para contratar el servicio
    alert('Funcionalidad de contratación en desarrollo');
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
    <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs y navegación */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <FaArrowLeft size={14} />
              Volver
            </Button>
            
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
                  {service.images && service.images.length > 0 ? (
                    <ServiceImageCarousel images={service.images} title={service.title} />
                  ) : (
                    <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src="/default_project.jpeg"
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Información del servicio */}
                <div className="space-y-6">
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
                      <span className="text-sm">Estimado: {service.estimatedHours} horas</span>
                    </div>
                  </div>

                  {/* Información del propietario */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border">
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
                        <p className="text-sm text-gray-600 truncate">{service.owner?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y Acciones en una fila */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Fechas - Lado izquierdo */}
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

                    {/* Acciones - Lado derecho */}
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
                        <>
                          <Button
                            variant="neutral"
                            onClick={handleContract}
                            className="flex items-center gap-2 px-4 py-2 text-sm"
                          >
                            <FaHandshake size={14} />
                            Contratar
                          </Button>
                          <Button
                            variant="informative"
                            onClick={handleChat}
                            className="flex items-center gap-2 px-4 py-2 text-sm"
                          >
                            <FaComments size={14} />
                            Negociar
                          </Button>
                        </>
                      )}
                    </div>
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
            </div> 
          </div> 
        </div> 
      </main> 
    </div> 
  );
}
export default ServiceDetail;
