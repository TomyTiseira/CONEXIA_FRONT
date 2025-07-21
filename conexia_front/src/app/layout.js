// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
