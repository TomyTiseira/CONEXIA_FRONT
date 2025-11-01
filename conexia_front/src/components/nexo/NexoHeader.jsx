'use client';

import { Minimize2, Sparkles } from 'lucide-react';

export default function NexoHeader({ onMinimize, isConnected }) {
  return (
    <div 
      className="relative text-white p-5 rounded-t-2xl overflow-hidden border border-conexia-green"
      style={{ 
        backgroundImage: 'url(/bg-smoke2.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >
      {/* Overlay oscuro para mejorar contraste del texto */}
      <div className="absolute inset-0 bg-conexia-green/80" />
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Ícono del zorro con animación */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-breathing" />
            <span className="relative text-4xl transform hover:scale-110 transition-transform duration-300 cursor-pointer">
              🦊
            </span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl tracking-wide drop-shadow-sm">NEXO</h3>
              {isConnected && (
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                {isConnected && (
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                )}
              </div>
              <p className="text-xs font-medium text-white/90 tracking-wide drop-shadow-sm">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onMinimize}
          className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/10"
          title="Minimizar"
        >
          <Minimize2 size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
