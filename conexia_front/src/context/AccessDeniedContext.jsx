"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AccessDenied from "@/components/common/AccessDenied";

const AccessDeniedContext = createContext();

export function useAccessDenied() {
  return useContext(AccessDeniedContext);
}

export function AccessDeniedProvider({ children }) {
  const [deniedInfo, setDeniedInfo] = useState(null);

  useEffect(() => {
    // Registrar función global para que fetchWithRefresh pueda llamarla
    if (typeof window !== 'undefined') {
      window.showAccessDenied = (info) => {
        setDeniedInfo(info);
      };

      // Limpiar al desmontar
      return () => {
        delete window.showAccessDenied;
      };
    }
  }, []);

  return (
    <AccessDeniedContext.Provider value={{ deniedInfo, setDeniedInfo }}>
      {/* Modal de acceso denegado */}
      {deniedInfo && (
        <AccessDenied 
          title={deniedInfo.title}
          message={deniedInfo.message}
          reason={deniedInfo.reason}
          showLogoutButton={true}
        />
      )}
      {children}
    </AccessDeniedContext.Provider>
  );
}
