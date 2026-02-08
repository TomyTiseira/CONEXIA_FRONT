"use client";

import { createContext, useContext, useState, useEffect } from "react";
import SuspensionBanner from "@/components/common/SuspensionBanner";

const SuspensionContext = createContext();

export function useSuspension() {
  return useContext(SuspensionContext);
}

export function SuspensionProvider({ children }) {
  const [suspensionInfo, setSuspensionInfo] = useState(null);

  useEffect(() => {
    // Registrar función global para que fetchWithRefresh pueda llamarla
    if (typeof window !== 'undefined') {
      window.showSuspensionBanner = (message, expiresAt) => {
        setSuspensionInfo({ message, expiresAt });
      };

      // Limpiar al desmontar
      return () => {
        delete window.showSuspensionBanner;
      };
    }
  }, []);

  const handleCloseBanner = () => {
    setSuspensionInfo(null);
  };

  return (
    <SuspensionContext.Provider value={{ suspensionInfo, setSuspensionInfo }}>
      {/* Banner flotante para suspensión detectada en runtime */}
      {suspensionInfo && (
        <SuspensionBanner 
          message={suspensionInfo.message}
          expiresAt={suspensionInfo.expiresAt}
          onClose={handleCloseBanner}
        />
      )}
      {children}
    </SuspensionContext.Provider>
  );
}
