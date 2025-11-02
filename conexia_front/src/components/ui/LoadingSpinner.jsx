"use client";
import Image from "next/image";

export const LoadingSpinner = ({ 
  message = "Cargando...", 
  fullScreen = true, 
  size = "default",
  showLogo = true 
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-16 h-16",
    large: "w-24 h-24"
  };

  const logoSizes = {
    small: { width: 24, height: 24 },
    default: { width: 40, height: 40 },
    large: { width: 64, height: 64 }
  };

  const containerClasses = fullScreen 
    ? "flex items-center justify-center min-h-screen bg-gradient-to-br from-conexia-soft via-white to-conexia-soft/50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-6 animate-fade-in">
        {/* Logo animado con círculo giratorio */}
        <div className="relative flex items-center justify-center">
          {/* Círculo giratorio externo */}
          {showLogo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-conexia-green rounded-full animate-spin`}></div>
            </div>
          )}
          
          {/* Logo de Conexia */}
          {showLogo ? (
            <div className="relative z-10 animate-pulse">
              <Image 
                src="/logo.png" 
                alt="Conexia" 
                width={logoSizes[size].width}
                height={logoSizes[size].height}
                className="drop-shadow-lg"
                priority
              />
            </div>
          ) : (
            <div className={`${sizeClasses[size]} border-4 border-conexia-green border-t-transparent rounded-full animate-spin`}></div>
          )}
        </div>

        {/* Texto de carga */}
        {message && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-conexia-green">
              {message}
            </h2>
            <p className="text-sm text-gray-600">Por favor, esperá un momento...</p>
            
            {/* Barra de progreso animada */}
            <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-conexia-green via-conexia-green/70 to-conexia-green rounded-full animate-loading-bar"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 