'use client';

import { Lock, Eye, Database, UserCheck, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div 
        className="relative py-16 text-white overflow-hidden"
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
        
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Lock size={48} className="text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              Políticas de privacidad
            </h1>
          </div>
          <p className="text-lg text-white/90 drop-shadow">
            Tu privacidad es nuestra prioridad en CONEXIA
          </p>
          <p className="text-sm text-white/70 mt-2">
            Última actualización: Noviembre 2025
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Compromiso */}
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Shield size={24} className="text-conexia-green" />
                Nuestro compromiso con tu privacidad
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En <strong>CONEXIA</strong>, protegemos tus datos personales con los más altos estándares de seguridad. 
                Esta política explica qué información recopilamos, cómo la usamos y tus derechos sobre ella.
              </p>
            </div>
          </section>

          {/* Información que recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Database className="text-conexia-green" size={28} />
              1. Información que recopilamos
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Información personal
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Nombre completo, correo electrónico y número de teléfono</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Información profesional (experiencia, habilidades, portafolio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Datos de facturación y métodos de pago</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Información de uso
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Actividad en la plataforma (servicios buscados, publicaciones, mensajes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Datos técnicos (dirección IP, navegador, dispositivo)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-conexia-green">•</span>
                    <span>Cookies y tecnologías similares de seguimiento</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo usamos tu información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Eye className="text-conexia-green" size={28} />
              2. Cómo usamos tu información
            </h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-200">
                <div className="text-2xl">🔐</div>
                <div>
                  <p className="font-semibold text-gray-800">Seguridad y autenticación</p>
                  <p className="text-sm text-gray-600">Verificar tu identidad y proteger tu cuenta</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-200">
                <div className="text-2xl">🤝</div>
                <div>
                  <p className="font-semibold text-gray-800">Conexiones profesionales</p>
                  <p className="text-sm text-gray-600">Facilitar el contacto entre profesionales y clientes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-200">
                <div className="text-2xl">📧</div>
                <div>
                  <p className="font-semibold text-gray-800">Comunicaciones</p>
                  <p className="text-sm text-gray-600">Enviarte notificaciones importantes y actualizaciones</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-transparent rounded-lg border border-yellow-200">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="font-semibold text-gray-800">Mejora del servicio</p>
                  <p className="text-sm text-gray-600">Analizar el uso para optimizar la experiencia del usuario</p>
                </div>
              </div>
            </div>
          </section>

          {/* Compartir información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <UserCheck className="text-conexia-green" size={28} />
              3. Compartir tu información
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>No vendemos tu información personal.</strong> Solo compartimos datos en los siguientes casos:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Con otros usuarios cuando contratas o ofreces servicios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Con proveedores de servicios que nos ayudan a operar la plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Cuando la ley lo requiera o para proteger nuestros derechos</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Seguridad de tus datos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-conexia-green/10 to-blue-50 p-4 rounded-lg border border-conexia-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔒</span>
                  <h3 className="font-semibold text-gray-800">Encriptación</h3>
                </div>
                <p className="text-sm text-gray-600">Usamos SSL/TLS para proteger datos en tránsito</p>
              </div>
              
              <div className="bg-gradient-to-br from-conexia-green/10 to-blue-50 p-4 rounded-lg border border-conexia-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="font-semibold text-gray-800">Protección</h3>
                </div>
                <p className="text-sm text-gray-600">Sistemas de seguridad avanzados contra accesos no autorizados</p>
              </div>
            </div>
          </section>

          {/* Tus derechos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-conexia-green" size={28} />
              5. Tus derechos
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">Tienes derecho a:</p>
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Acceder a tus datos personales</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Rectificar información incorrecta</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Solicitar la eliminación de tu cuenta</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Oponerte al procesamiento de tus datos</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Exportar tus datos en formato portable</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-lg p-6 border border-conexia-green/20">
            <h2 className="text-xl font-bold text-gray-800 mb-3">¿Preguntas sobre privacidad?</h2>
            <p className="text-gray-700 mb-4">
              Si tienes dudas sobre cómo manejamos tus datos o quieres ejercer tus derechos, contáctanos.
            </p>
            <div className="flex gap-3">
              <Link 
                href="/"
                className="inline-block px-6 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 
                         transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
