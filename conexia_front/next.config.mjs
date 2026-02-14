/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Configuración para desarrollo local
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/images/**",
      },
      // Configuración para producción - Agregar dominio del backend en producción
      // Ejemplo: Si tu backend está en https://api.conexia.com
      {
        protocol: "https",
        hostname: "**", // Acepta cualquier hostname HTTPS (más flexible)
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "**", // También HTTP por si acaso
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/conexia-profile-images/**",
      },
    ],
  },
};

export default nextConfig;
