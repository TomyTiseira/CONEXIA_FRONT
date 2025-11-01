// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ConnectionRequestsProvider } from "@/context/ConnectionRequestsContext";
import { ChatWidgetsProvider } from "@/context/ChatWidgetsContext";
import NexoChat from "@/components/nexo/NexoChat";

export const metadata = {
  title: "Conexia",
  description: "Conectamos talentos con oportunidades",
  icons: {
    icon: "/logo.png", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#eaf5f2] text-conexia-green">
        <AuthProvider>
          <ConnectionRequestsProvider>
            <ChatWidgetsProvider>
              {children}
              {/* NEXO - Chatbot Virtual (disponible globalmente) */}
              <NexoChat />
            </ChatWidgetsProvider>
          </ConnectionRequestsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
