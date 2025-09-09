// ...existing code...
"use client";
import React, { useState } from "react";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import ConnectionsSidebar from "@/components/connections/ConnectionsSidebar";
import ConnectionRequestsSection from "@/components/connections/ConnectionRequestsSection";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotFound } from "@/components/ui";
import { ROLES } from "@/constants/roles";

function RecommendedSection() {
  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
      <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
      <div className="text-conexia-green/70 text-center py-8">No hay recomendaciones por ahora. ¡Vuelve pronto!</div>
    </div>
  );
  // TODO: Reemplazar estos mocks por datos reales del contexto/store/API
  const allUsers = [];
  const myContacts = [];
  const mySkills = [];
  const friendsMap = {};
  const myId = null;
  const connectUser = (id) => {
    // Implementar lógica de conexión
    console.log('Conectar con usuario', id);
  };
  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Personas recomendadas</div>
      <div className="text-conexia-green/80 mb-6">Conecta con personas sugeridas según tus intereses y actividad en Conexia.</div>
      <RecommendationsList
        allUsers={allUsers}
        myContacts={myContacts}
        mySkills={mySkills}
        friendsMap={friendsMap}
        myId={myId}
        onConnect={connectUser}
        max={12}
      />
    </div>
  );
}
import { RecommendationsList } from "@/components/connections/RecommendationsList";
function MyConnectionsSection() {
  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Mis conexiones</div>
      <div className="text-conexia-green/80 mb-6">Personas con las que ya conectaste en Conexia.</div>
      <div className="text-conexia-green/70 text-center py-8">Aún no tienes conexiones. ¡Empieza a conectar!</div>
    </div>
  );
}
function SentRequestsSection() {
  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Solicitudes enviadas</div>
      <div className="text-conexia-green/80 mb-6">Solicitudes de conexión que enviaste a otros usuarios.</div>
      <div className="text-conexia-green/70 text-center py-8">No has enviado solicitudes recientemente.</div>
    </div>
  );
}

const sectionComponents = {
  recommended: RecommendedSection,
  requests: ConnectionRequestsSection,
  "my-connections": MyConnectionsSection,
  sent: SentRequestsSection,
};

export default function ConnectionsPage() {
  const [selected, setSelected] = useState("recommended");
  const SectionComponent = sectionComponents[selected] || (() => null);

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER]}
      fallbackComponent={<NotFound />}
    >
      <div className="w-full bg-gray-50 min-h-screen">
        <NavbarCommunity />
        <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0 md:gap-8 px-2 md:px-6 mt-2 md:mt-4 pb-16 items-start">
          {/* Mobile: Panel de conexiones arriba del contenido, Desktop: sidebar a la izquierda */}
          <div className="w-full md:w-[270px] lg:w-[300px] flex-shrink-0 flex flex-col items-stretch md:items-start md:mr-2 md:mt-4">
            <div className="block md:hidden mt-2 mb-2">
              <ConnectionsSidebar selected={selected} onSelect={setSelected} />
            </div>
            <div className="hidden md:block">
              <ConnectionsSidebar selected={selected} onSelect={setSelected} />
            </div>
          </div>
          {/* Contenido principal en rectángulo */}
          <div className="flex-1 min-w-0 flex flex-col md:mt-4">
            <div className="w-full bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-4 sm:px-8 py-6 md:py-8 mt-2 md:mt-0 mb-2 transition-all">
              <div className="w-full h-full">
                <SectionComponent />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}