'use client';

import { Cookie, Settings, BarChart3, Shield, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function CookiePolicy() {
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
            <Cookie size={48} className="text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              Política de Cookies
            </h1>
          </div>
          <p className="text-lg text-white/90 drop-shadow">
            Cómo usamos cookies para mejorar tu experiencia
          </p>
          <p className="text-sm text-white/70 mt-2">
            Última actualización: Noviembre 2025
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Qué son las cookies */}
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Cookie size={24} className="text-conexia-green" />
                ¿Qué son las Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas 
                <strong> CONEXIA</strong>. Nos ayudan a recordar tus preferencias, mantener tu sesión activa 
                y mejorar tu experiencia en la plataforma.
              </p>
            </div>
          </section>

          {/* Tipos de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Settings className="text-conexia-green" size={28} />
              1. Tipos de Cookies que Usamos
            </h2>
            <div className="space-y-4">
              
              <div className="bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔐</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Cookies Esenciales</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Necesarias para el funcionamiento básico de la plataforma. No se pueden desactivar.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <span>Mantener tu sesión iniciada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <span>Recordar preferencias de idioma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <span>Seguridad y prevención de fraude</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Cookies Analíticas</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Nos ayudan a entender cómo los usuarios interactúan con la plataforma.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Número de visitantes y páginas vistas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Tiempo de permanencia en la plataforma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Origen del tráfico y comportamiento del usuario</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-transparent border-l-4 border-purple-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚙️</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Cookies Funcionales</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Mejoran la funcionalidad y personalizan tu experiencia.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Recordar tus preferencias de visualización</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Guardar filtros de búsqueda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Configuración de notificaciones</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-transparent border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Cookies de Marketing</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Usadas para mostrar contenido relevante y medir la efectividad de campañas.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>Personalizar anuncios según tus intereses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>Medir el rendimiento de campañas publicitarias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>Evitar mostrar el mismo anuncio repetidamente</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies de terceros */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <BarChart3 className="text-conexia-green" size={28} />
              2. Cookies de Terceros
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-4 leading-relaxed">
                También utilizamos servicios de terceros que pueden instalar sus propias cookies:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800 text-sm">Google Analytics</p>
                  <p className="text-xs text-gray-600">Para análisis de tráfico y comportamiento</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800 text-sm">Stripe / PayPal</p>
                  <p className="text-xs text-gray-600">Para procesar pagos de forma segura</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800 text-sm">Redes Sociales</p>
                  <p className="text-xs text-gray-600">Para compartir contenido y autenticación</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800 text-sm">CDN Services</p>
                  <p className="text-xs text-gray-600">Para mejorar velocidad de carga</p>
                </div>
              </div>
            </div>
          </section>

          {/* Gestionar cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <CheckSquare className="text-conexia-green" size={28} />
              3. Cómo Gestionar las Cookies
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">En tu Navegador</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Puedes configurar tu navegador para rechazar cookies o alertarte cuando se envíen:
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span className="text-gray-700">Chrome: Configuración &gt; Privacidad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🦊</span>
                    <span className="text-gray-700">Firefox: Opciones &gt; Privacidad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🧭</span>
                    <span className="text-gray-700">Safari: Preferencias &gt; Privacidad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔷</span>
                    <span className="text-gray-700">Edge: Configuración &gt; Cookies</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield size={20} className="text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Nota Importante</h3>
                    <p className="text-sm text-gray-700">
                      Bloquear todas las cookies puede afectar la funcionalidad de CONEXIA. 
                      Algunas características pueden no funcionar correctamente sin cookies esenciales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Duración */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Duración de las Cookies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-transparent p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">🕐 Cookies de Sesión</h3>
                <p className="text-sm text-gray-600">
                  Se eliminan automáticamente cuando cierras el navegador. Se usan para mantener tu sesión activa.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-transparent p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-2">📅 Cookies Persistentes</h3>
                <p className="text-sm text-gray-600">
                  Permanecen en tu dispositivo por un tiempo definido. Se usan para recordar preferencias.
                </p>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-lg p-6 border border-conexia-green/20">
            <h2 className="text-xl font-bold text-gray-800 mb-3">¿Preguntas sobre cookies?</h2>
            <p className="text-gray-700 mb-4">
              Si tienes dudas sobre nuestra política de cookies, estamos aquí para ayudarte.
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 
                       transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Volver al inicio
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
