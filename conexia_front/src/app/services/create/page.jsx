'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreateServiceForm from '@/components/services/CreateServiceForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ServicePreviewModal from '@/components/services/ServicePreviewModal';
import ImageZoomModal from '@/components/services/ImageZoomModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import Navbar from '@/components/navbar/Navbar';
import { PublicationLimitBanner } from '@/components/plans';
import { useSubscriptionLimits } from '@/hooks/memberships';
import { ArrowLeft } from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();
  const { servicesLimit, planName, isLoading: limitsLoading } = useSubscriptionLimits();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImages, setZoomImages] = useState([]);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const confirmPublishRef = useRef();
  const confirmClearRef = useRef();

  const handleShowPreview = (serviceData, serviceCategories) => {
    setPreviewData(serviceData);
    setCategories(serviceCategories);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleShowImageZoom = (images, index) => {
    setZoomImages(images);
    setZoomIndex(index);
    setShowImageZoom(true);
  };

  const handleCloseImageZoom = () => {
    setShowImageZoom(false);
    setZoomImages([]);
    setZoomIndex(0);
  };

  const handleConfirmPublish = () => {
    if (confirmPublishRef.current) {
      confirmPublishRef.current();
    }
  };

  const handleShowToast = (toastData) => {
    setToast(toastData);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleShowClearConfirm = () => {
    setShowClearConfirm(true);
  };

  const handleCloseClearConfirm = () => {
    setShowClearConfirm(false);
  };

  const handleConfirmClear = () => {
    if (confirmClearRef.current) {
      confirmClearRef.current();
    }
    setShowClearConfirm(false);
  };

  // Detectar si la URL tiene ?logout=true
  let isForceLogout = false;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    isForceLogout = params.get('logout') === 'true';
  }

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER]}
      fallbackComponent={isForceLogout ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}
    >
      <div className="relative min-h-screen w-full bg-conexia-soft overflow-hidden flex flex-col">
        {/* Navbar fijo arriba */}
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>

        {/* Fondo de niebla y decoraciones */}
        <div className="absolute inset-0 z-0">

        </div>

      {/* Contenedor para centrar el formulario */}
      <div className="flex-1 flex items-center justify-center relative z-10 pt-20 sm:pt-24 pb-8">
          <div className="w-full max-w-4xl px-4 flex flex-col gap-6">
            {/* Indicador de límites - Nuevo estilo */}
            <PublicationLimitBanner 
              type="service"
              current={servicesLimit.current}
              limit={servicesLimit.limit}
              planName={planName}
              isLoading={limitsLoading}
            />

            {/* Formulario principal */}
            <section className="w-full bg-white/90 border border-conexia-green/30 rounded-xl shadow-lg px-6 py-10 flex flex-col animate-fadeIn backdrop-blur-sm">
              <div className="mb-8 text-center">
                <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight">
                  Publica tu servicio
                </h1>
                <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                  Ofrece tus habilidades a la comunidad
                </p>
              </div>
              <div className="w-full flex-1 flex flex-col justify-center">
                <CreateServiceForm 
                  onShowPreview={handleShowPreview}
                  onClosePreview={handleClosePreview}
                  onShowImageZoom={handleShowImageZoom}
                  showPreview={showPreview}
                  onConfirmPublish={confirmPublishRef}
                  onShowToast={handleShowToast}
                  onShowClearConfirm={handleShowClearConfirm}
                  onConfirmClear={confirmClearRef}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* Modals at page level - outside containers */}
      {previewData && (
        <ServicePreviewModal
          open={showPreview}
          onClose={handleClosePreview}
          onConfirm={handleConfirmPublish}
          serviceData={previewData}
          category={Array.isArray(categories) ? categories.find(cat => cat.id == previewData.categoryId) : null}
          loading={false}
        />
      )}
      
      <ImageZoomModal
        open={showImageZoom}
        onClose={handleCloseImageZoom}
        images={zoomImages}
        initialIndex={zoomIndex}
      />
      
      {/* Modal de confirmación para limpiar formulario */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={handleCloseClearConfirm}
        onConfirm={handleConfirmClear}
        title="Limpiar formulario"
        message="¿Estás seguro de que quieres limpiar todos los datos del formulario? Esta acción no se puede deshacer."
        confirmButtonText="Limpiar"
        cancelButtonText="Cancelar"
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
    </ProtectedRoute>
  );
}