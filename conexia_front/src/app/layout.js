// src/app/layout.tsx
import "./globals.css";

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
      <body className="bg-white text-conexia-green">
        {children}
      </body>
    </html>
  );
}
