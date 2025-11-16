"use client";
import { Users, Briefcase, TrendingUp, Shield, Star, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroHome() {
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const features = [
    { 
      icon: Users, 
      title: "Visibilidad", 
      desc: "Muestra tus habilidades y construye tu reputación profesional"
    },
    { 
      icon: Briefcase, 
      title: "Oportunidades", 
      desc: "Accede a proyectos y servicios que potencian tu crecimiento"
    },
    { 
      icon: TrendingUp, 
      title: "Comunidad", 
      desc: "Crece compartiendo, aprendiendo y generando valor juntos"
    },
    { 
      icon: Shield, 
      title: "Confianza", 
      desc: "Pagos seguros y reseñas verificadas que protegen tu trabajo"
    }
  ];

  return (
    <section className="relative flex-1 overflow-hidden bg-[#0a1f1c]">
      {/* Video Background con fallback a imagen */}
      <div className="absolute inset-0">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-150"
            onError={() => setVideoError(true)}
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
        ) : (
          <Image
            src="/images/hero-background.jpg"
            alt="Background"
            fill
            className="object-cover opacity-160"
            priority
          />
        )}
      </div>

      {/* Overlay con colores CONEXIA */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#367d7d]/95 via-[#2b6a6a]/90 to-[#204b4b]/95"></div>

      {/* Efectos sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#48a6a7]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#367d7d]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start w-full">
          {/* Left Column - Hero Text */}
          <div className="text-white space-y-6 lg:space-y-8 w-full lg:w-1/2">
            <div className="space-y-4">
              {/* Título principal todo en blanco */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Conectamos talentos
                <br />
                con oportunidades
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl leading-relaxed">
                Una plataforma que no solo conecta personas, sino que potencia trayectorias profesionales.
              </p>
            </div>
            
            {/* CTA Button con resplandor coral */}
            <div className="relative inline-block">
              {/* Resplandor coral detrás */}
              <div className="absolute -inset-3 bg-gradient-to-r from-[#bf373e]/40 via-[#ff4953]/40 to-[#bf373e]/40 rounded-2xl blur-2xl opacity-60 animate-glow-pulse"></div>
              
              {/* Botón principal */}
              <Link
                href="/register"
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f36970] to-[#ff4953] text-white px-8 py-4 rounded-xl font-bold hover:from-[#ff4953] hover:to-[#f36970] transition-all shadow-[0_8px_30px_rgba(243,105,112,0.4),0_4px_15px_rgba(255,73,83,0.3)] hover:shadow-[0_10px_40px_rgba(243,105,112,0.5),0_6px_20px_rgba(255,73,83,0.4)] transform hover:scale-105 group"
              >
                <span className="text-lg">Registrarse ahora</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 w-full lg:w-1/2">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              
              return (
                <div 
                  key={idx}
                  className="group relative"
                >
                  {/* Borde sutil en hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#48a6a7] to-[#367d7d] rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/20 hover:border-[#48a6a7]/40 transition-all duration-300 h-full flex flex-col min-h-[200px]">
                    {/* Icon con degradado celeste CONEXIA */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[#b8d4d4] via-[#9bc4c5] to-[#7eb5b6] rounded-lg flex items-center justify-center mb-3 group-hover:from-[#7eb5b6] group-hover:via-[#61a6a7] group-hover:to-[#48a6a7] transition-all duration-300 shadow-[0_2px_8px_rgba(184,212,212,0.3),0_4px_16px_rgba(126,181,182,0.2)] group-hover:shadow-[0_3px_12px_rgba(72,166,167,0.5),0_6px_20px_rgba(54,125,125,0.4)]">
                      <Icon className="w-6 h-6 text-[#193a3a] group-hover:text-[#0d2020] drop-shadow-sm transition-colors duration-300" strokeWidth={2.5} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}