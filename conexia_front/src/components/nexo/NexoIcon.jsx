'use client';

export default function NexoIcon({ onClick, hasNewMessage, isMinimized }) {
  return (
    <button
      onClick={onClick}
      className="group relative"
      aria-label="Abrir Nexo"
    >
      {/* Botón principal con fondo de humo y verde CONEXIA */}
      <div 
        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg hover:shadow-xl 
                   transition-all duration-300 hover:scale-110 active:scale-95 animate-breathing 
                   border-2 border-conexia-green overflow-hidden"
        style={{ 
          backgroundImage: 'url(/bg-smoke2.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Overlay verde */}
        <div className="absolute inset-0 bg-conexia-green/80" />
        
        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '15px 15px'
        }} />
        
        {/* Zorro */}
        <span className="relative text-3xl z-10">🦊</span>
      </div>
      
      {/* Badge de conexión/estado - fuera del overflow-hidden */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md" />
      
      {/* Badge de notificación */}
      {hasNewMessage && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white 
                        flex items-center justify-center animate-pulse shadow-md">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
      
      {/* Tooltip: always show a single short label */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                      pointer-events-none z-30">
        Abrir Nexo
        <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1" />
      </div>
      
      {/* Ripple effect en hover */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 
                      group-hover:scale-150 transition-all duration-500" />
    </button>
  );
}
