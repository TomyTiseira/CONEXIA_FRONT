'use client';

import { HelpCircle, Search, MessageCircle, BookOpen, Users, CreditCard, Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Users,
      title: 'Primeros pasos',
      color: 'from-blue-400 to-blue-600',
      faqs: [
        {
          q: '¿Cómo creo una cuenta en CONEXIA?',
          a: 'Haz clic en "Registrarse" en la página principal, completa el formulario con tus datos y verifica tu email. ¡Es gratis y solo toma unos minutos!'
        },
        {
          q: '¿Qué tipos de usuario existen?',
          a: 'CONEXIA tiene tres tipos: Freelancers (ofrecen servicios), Empresas (contratan servicios) y Usuarios mixtos (pueden hacer ambas cosas).'
        },
        {
          q: '¿Cómo completo mi perfil profesional?',
          a: 'Ve a tu perfil, agrega tu experiencia, habilidades, portafolio y una descripción atractiva. Un perfil completo aumenta tus oportunidades.'
        }
      ]
    },
    {
      icon: BookOpen,
      title: 'Servicios y proyectos',
      color: 'from-purple-400 to-purple-600',
      faqs: [
        {
          q: '¿Cómo publico un servicio?',
          a: 'Ve a "Mis servicios" > "Crear servicio". Describe tu oferta, establece precio, plazos de entrega y sube ejemplos de tu trabajo.'
        },
        {
          q: '¿Cómo busco profesionales?',
          a: 'Usa la barra de búsqueda o explora por categorías. Filtra por habilidades, experiencia, valoraciones y ubicación para encontrar el talento perfecto.'
        },
        {
          q: '¿Puedo negociar precios?',
          a: 'Sí, el sistema de mensajería te permite discutir detalles del proyecto y acordar términos personalizados antes de cerrar el acuerdo.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'Pagos y facturación',
      color: 'from-green-400 to-green-600',
      faqs: [
        {
          q: '¿Qué métodos de pago aceptan?',
          a: 'Aceptamos tarjetas de crédito/débito, PayPal, transferencias bancarias y billeteras digitales. Todos los pagos son 100% seguros.'
        },
        {
          q: '¿Cuándo recibo mi pago?',
          a: 'Los freelancers reciben el pago cuando el cliente confirma la entrega satisfactoria del trabajo. El dinero se libera en 24-48 horas.'
        },
        {
          q: '¿Cuáles son las comisiones?',
          a: 'CONEXIA cobra una comisión del 10% sobre cada transacción. Los planes Premium tienen comisiones reducidas y beneficios adicionales.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Seguridad y confianza',
      color: 'from-amber-400 to-amber-600',
      faqs: [
        {
          q: '¿Cómo funciona el sistema de garantía?',
          a: 'El dinero se retiene de forma segura hasta que el trabajo esté completado. Si hay problemas, nuestro equipo de mediación interviene.'
        },
        {
          q: '¿Cómo verifico la identidad de un usuario?',
          a: 'Los perfiles verificados tienen una insignia azul. Revisa valoraciones, portafolio y tiempo en la plataforma antes de contratar.'
        },
        {
          q: '¿Qué hago si tengo un problema con un servicio?',
          a: 'Contacta primero al usuario para resolver. Si no hay solución, abre un reclamo y nuestro equipo mediará para encontrar una solución justa.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div 
        className="relative py-20 text-white overflow-hidden"
        style={{ 
          backgroundImage: 'url(/bg-smoke2.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="absolute inset-0 bg-conexia-green/90" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <HelpCircle size={56} className="text-yellow-300" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg mb-4">
            Centro de ayuda
          </h1>
          <p className="text-xl text-white/90 drop-shadow mb-8">
            ¿En qué podemos ayudarte hoy?
          </p>

          {/* Buscador */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Busca tu pregunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Accesos rápidos */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center group"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="text-blue-600" size={32} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Chat con NEXO</h3>
            <p className="text-sm text-gray-600">Nuestro asistente virtual está listo para ayudarte 24/7</p>
          </Link>

          <Link 
            href="/terms"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center group"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Settings className="text-purple-600" size={32} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Políticas y términos</h3>
            <p className="text-sm text-gray-600">Consulta nuestras condiciones de uso y políticas</p>
          </Link>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center group cursor-pointer">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="text-green-600" size={32} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Comunidad</h3>
            <p className="text-sm text-gray-600">Únete a foros y discusiones con otros usuarios</p>
          </div>
        </div>

        {/* Categorías de FAQs */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Preguntas frecuentes
          </h2>

          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header de categoría */}
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Icon size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                  </div>
                </div>

                {/* FAQs */}
                <div className="p-6 space-y-4">
                  {category.faqs.map((faq, faqIdx) => (
                    <details 
                      key={faqIdx}
                      className="group bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <summary className="font-semibold text-gray-800 flex items-start gap-3 list-none">
                        <span className="text-conexia-green text-xl group-open:rotate-90 transition-transform">▸</span>
                        <span className="flex-1">{faq.q}</span>
                      </summary>
                      <div className="mt-3 ml-8 text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contacto */}
        <div className="mt-12 bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-2xl p-8 border border-conexia-green/20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">¿No encontraste lo que buscabas?</h2>
          <p className="text-gray-700 mb-6">
            Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
              <MessageCircle size={20} />
              Chat en vivo
            </button>
            <Link 
              href="/"
              className="px-6 py-3 bg-white text-conexia-green border-2 border-conexia-green rounded-lg hover:bg-conexia-green/5 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
