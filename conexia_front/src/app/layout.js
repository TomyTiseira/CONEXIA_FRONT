// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ConnectionRequestsProvider } from "@/context/ConnectionRequestsContext";
import { ChatWidgetsProvider } from "@/context/ChatWidgetsContext";
import { SuspensionProvider } from "@/context/SuspensionContext";
import { AccessDeniedProvider } from "@/context/AccessDeniedContext";
import NexoChat from "@/components/nexo/NexoChat";
import BannedAccountModal from "@/components/common/BannedAccountModal";
import HttpErrorProvider from "@/components/providers/HttpErrorProvider";

export const metadata = {
  title: "Conexia",
  description: "Conectamos talentos con oportunidades",
  icons: {
    icon: "/logo.png", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[#eaf5f2] text-conexia-green">
        <AuthProvider>
          <ConnectionRequestsProvider>
            <ChatWidgetsProvider>
              <SuspensionProvider>
                <AccessDeniedProvider>
                  <HttpErrorProvider>
                    {/* Modal de baneo (bloquea toda la UI si usuario está baneado) */}
                    <BannedAccountModal />
                    
                    {children}
                    
                    {/* NEXO - Chatbot Virtual (disponible globalmente) */}
                    <NexoChat />
                  </HttpErrorProvider>
                </AccessDeniedProvider>
              </SuspensionProvider>
            </ChatWidgetsProvider>
          </ConnectionRequestsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
