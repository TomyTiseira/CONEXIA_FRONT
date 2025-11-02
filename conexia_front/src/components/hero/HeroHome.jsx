"use client";
import { Users, Briefcase, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroHome() {
  const [isMobile, setIsMobile] = useState(false);
  const [flippedCard, setFlippedCard] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const features = [
    { 
      icon: Users, 
      title: "Red Profesional", 
      desc: "Conecta con talento verificado",
      emoji: "👥",
      color: "from-blue-400 to-blue-600",
      backContent: "Construye una red sólida de contactos profesionales. Conecta con freelancers certificados, empresas verificadas y expertos en tu industria."
    },
    { 
      icon: Briefcase, 
      title: "Servicios y Proyectos", 
      desc: "Encuentra oportunidades laborales",
      emoji: "💼",
      color: "from-purple-400 to-purple-600",
      backContent: "Accede a miles de proyectos y servicios. Ofrece tus habilidades o contrata profesionales para llevar tu negocio al siguiente nivel."
    },
    { 
      icon: TrendingUp, 
      title: "Crece Profesionalmente", 
      desc: "Desarrolla tu carrera",
      emoji: "📈",
      color: "from-green-400 to-green-600",
      backContent: "Impulsa tu crecimiento profesional con herramientas de seguimiento, evaluaciones y feedback constante de tus clientes."
    },
    { 
      icon: Shield, 
      title: "Pagos Seguros", 
      desc: "Transacciones protegidas",
      emoji: "🛡️",
      color: "from-amber-400 to-amber-600",
      backContent: "Sistema de pagos 100% seguro con protección para compradores y vendedores. Tus transacciones están garantizadas."
    }
  ];

  const handleCardClick = (idx) => {
    setFlippedCard(flippedCard === idx ? null : idx);
  };

  return (
    <section className="relative flex-1 overflow-hidden bg-gradient-to-br from-conexia-green via-[#0f4a42] to-[#0d2d28]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-conexia-green/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column - Hero Text */}
          <div className="text-white space-y-4">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Conectamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">talentos</span> con oportunidades
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
                La plataforma profesional donde freelancers y empresas se encuentran para colaborar en servicios y proyectos innovadores
              </p>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const isFlipped = flippedCard === idx;
              
              return (
                <div 
                  key={idx}
                  className="h-56 cursor-pointer"
                  onClick={() => handleCardClick(idx)}
                >
                  {!isFlipped ? (
                    /* Front of card */
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <div className="p-6 flex flex-col h-full justify-between">
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg text-4xl self-start`}>
                          {feature.emoji}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Back of card */
                    <div className="bg-gradient-to-br from-conexia-green to-[#0d2d28] rounded-xl shadow-lg h-full animate-fadeIn">
                      <div className="p-6 flex flex-col h-full justify-between">
                        <div>
                          <div className="text-3xl mb-3">{feature.emoji}</div>
                          <h3 className="text-lg font-bold text-white mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {feature.backContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}