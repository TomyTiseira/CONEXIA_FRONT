
"use client";
import { Suspense, useEffect } from "react";
import React, { useState } from "react";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import ConnectionsSidebar from "@/components/connections/ConnectionsSidebar";
import ConnectionRequestsSection from "@/components/connections/ConnectionRequestsSection";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotFound } from "@/components/ui";
import { ROLES } from "@/constants/roles";
import { useRecommendations } from "@/hooks/connections/useRecommendations";
import { sendConnectionRequest } from "@/service/connections/sendConnectionRequest";
import { useRouter } from "next/navigation";

function RecommendedSection() {
  const { recommendations, loading, error, refetch } = useRecommendations();
  const router = useRouter();

  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      // Actualizar las recomendaciones para remover el usuario conectado
      refetch();
    } catch (err) {
      console.error('Error al enviar solicitud de conexión:', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
        <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
          <span className="ml-3 text-conexia-green">Cargando recomendaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
        <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={refetch}
            className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="w-full">
        <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
        <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
        <div className="text-conexia-green/70 text-center py-8">No hay recomendaciones disponibles en este momento.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
      <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
      <RecommendationsList
        recommendations={recommendations}
        onConnect={handleConnect}
        onViewProfile={(userId) => router.push(`/profile/userProfile/${userId}`)}
        max={12}
      />
    </div>
  );
}
import { RecommendationsList } from "@/components/connections/RecommendationsList";
import MyConnectionsSection from '@/components/connections/MyConnectionsSection';
import SentRequestsSection from '@/components/connections/SentRequestsSection';

const sectionComponents = {
  recommended: RecommendedSection,
  requests: ConnectionRequestsSection,
  "my-connections": MyConnectionsSection,
  sent: SentRequestsSection,
};

export default function ConnectionsPage() {
  const [selected, setSelected] = useState("recommended");
  const SectionComponent = sectionComponents[selected] || (() => null);

  // Manejar parámetros de URL para seleccionar sección específica
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section && sectionComponents[section]) {
      setSelected(section);
    }
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-conexia-green">Cargando conexiones...</p>
        </div>
      </div>
    }>
      <ProtectedRoute
        allowedRoles={[ROLES.USER]}
        fallbackComponent={<NotFound />}
      >
    <div className="w-full bg-gray-50 min-h-screen" style={{overflowY: 'scroll', minHeight: '1px'}}>
          <NavbarCommunity />
          <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-2 md:gap-6 px-2 md:px-6 mt-2 md:mt-4 pb-16 items-start justify-start">
            {/* Mobile: Panel de conexiones arriba del contenido, Desktop: sidebar a la izquierda */}
            <div className="w-full max-w-[400px] mx-auto md:w-[270px] md:max-w-none md:mx-0 lg:w-[300px] flex-shrink-0 flex flex-col items-stretch md:items-start md:mt-4">
              <div className="block md:hidden mt-2 mb-2">
                <ConnectionsSidebar selected={selected} onSelect={setSelected} />
              </div>
              <div className="hidden md:block">
                <ConnectionsSidebar selected={selected} onSelect={setSelected} />
              </div>
            </div>
            {/* Contenido principal en rectángulo */}
              <div className="flex justify-center md:mt-4 w-full md:flex-1">
                <div className="w-full max-w-[400px] mx-auto md:max-w-none md:mx-0 bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-4 sm:px-8 py-6 md:py-8 mt-2 md:mt-0 mb-2 transition-all">
                  <div className="w-full h-full">
                    <SectionComponent />
                  </div>
                </div>
              </div>
          </main>
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}