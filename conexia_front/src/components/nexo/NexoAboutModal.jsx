'use client';

import { X, Sparkles, MessageCircle, Users, Zap, Heart } from 'lucide-react';

export default function NexoAboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div 
          className="relative p-6 text-white overflow-hidden"
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
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-breathing">🦊</div>
              <div>
                <h2 className="text-3xl font-bold drop-shadow-md flex items-center gap-2">
                  NEXO
                  <Sparkles size={24} className="text-yellow-300" />
                </h2>
                <p className="text-sm text-white/90 mt-1 drop-shadow">Tu asistente virtual en CONEXIA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ¿Qué es NEXO? */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MessageCircle className="text-conexia-green" size={24} />
              ¿Qué es NEXO?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              NEXO es tu compañero inteligente en la plataforma CONEXIA. Está diseñado para 
              ayudarte a navegar por el ecosistema, resolver dudas y conectarte con las 
              oportunidades adecuadas. Piensa en mí como tu guía personal que siempre está 
              disponible para ayudarte a crecer profesionalmente.
            </p>
          </section>

          {/* ¿Qué puedo hacer? */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="text-conexia-green" size={24} />
              ¿En qué puedo ayudarte?
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">🔍</div>
                <div>
                  <p className="font-semibold text-gray-800">Búsqueda de servicios</p>
                  <p className="text-sm text-gray-600">Te ayudo a encontrar el profesional o servicio perfecto para tu proyecto</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-semibold text-gray-800">Orientación de la plataforma</p>
                  <p className="text-sm text-gray-600">Explico cómo funciona CONEXIA y cómo aprovechar al máximo sus características</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">🤝</div>
                <div>
                  <p className="font-semibold text-gray-800">Conexiones estratégicas</p>
                  <p className="text-sm text-gray-600">Sugerencias para expandir tu red y encontrar colaboradores</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">📊</div>
                <div>
                  <p className="font-semibold text-gray-800">Información de proyectos</p>
                  <p className="text-sm text-gray-600">Detalles sobre tus servicios, contrataciones y actividad en la plataforma</p>
                </div>
              </div>
            </div>
          </section>

          {/* ¿Por qué un zorro? */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Heart className="text-conexia-green" size={24} />
              ¿Por qué un zorro digital?
            </h3>
            <div className="bg-gradient-to-br from-conexia-green/10 to-blue-50 p-4 rounded-lg border border-conexia-green/20">
              <p className="text-gray-700 leading-relaxed mb-3">
                El <strong>zorro</strong> representa cualidades esenciales en el mundo del networking 
                y los emprendimientos digitales:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold">•</span>
                  <span><strong>Astucia e inteligencia:</strong> Capacidad para encontrar soluciones creativas y conectar personas adecuadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold">•</span>
                  <span><strong>Adaptabilidad:</strong> Se ajusta a diferentes situaciones, igual que los emprendedores digitales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold">•</span>
                  <span><strong>Agilidad:</strong> Rápido, eficiente y siempre listo para ayudar, como debe ser un buen asistente virtual</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CONEXIA Ecosystem */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="text-conexia-green" size={24} />
              El ecosistema CONEXIA
            </h3>
            <p className="text-gray-600 leading-relaxed">
              CONEXIA es más que una plataforma de servicios, es un <strong>ecosistema de networking</strong> diseñado para emprendedores digitales y profesionales que buscan crecer. Aquí puedes:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">🌐</span>
                Ampliar tu red profesional
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">💼</span>
                Ofrecer tus servicios
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">🎯</span>
                Encontrar talento
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">🚀</span>
                Impulsar proyectos
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-conexia-green/5 border border-conexia-green/20 rounded-lg p-4 text-center">
            <p className="text-gray-700 mb-2">
              <strong>¿Listo para comenzar?</strong>
            </p>
            <p className="text-sm text-gray-600">
              Pregúntame lo que necesites. Estoy aquí para hacer tu experiencia en CONEXIA más fluida y productiva.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 
                     transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
