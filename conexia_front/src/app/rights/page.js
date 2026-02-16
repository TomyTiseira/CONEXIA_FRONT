'use client';

import { Scale, Copyright, FileCheck, AlertOctagon, Award, Users } from 'lucide-react';
import Link from 'next/link';

export default function RightsPolicy() {
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
            <Scale size={48} className="text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              Política de derechos
            </h1>
          </div>
          <p className="text-lg text-white/90 drop-shadow">
            Derechos de propiedad intelectual y uso del contenido en CONEXIA
          </p>
          <p className="text-sm text-white/70 mt-2">
            Última actualización: Noviembre 2025
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introducción */}
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Copyright size={24} className="text-conexia-green" />
                Protección de derechos intelectuales
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En <strong>CONEXIA</strong>, respetamos los derechos de propiedad intelectual de todos. 
                Esta política explica cómo protegemos tanto los derechos de la plataforma como los de 
                nuestros usuarios.
              </p>
            </div>
          </section>

          {/* Derechos de CONEXIA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Award className="text-conexia-green" size={28} />
              1. Derechos de CONEXIA
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-800 mb-2">Marca y logotipo</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  El nombre <strong>CONEXIA</strong>, el logotipo y todos los elementos de diseño de la 
                  plataforma son propiedad exclusiva y están protegidos por leyes de propiedad intelectual. 
                  No pueden ser usados sin autorización expresa.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-800 mb-2">Código y tecnología</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Todo el código, diseño, funcionalidad y tecnología de la plataforma son propiedad de CONEXIA. 
                  Queda prohibida la copia, modificación, distribución o ingeniería inversa del sistema.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-transparent border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-800 mb-2">Contenido de la plataforma</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Los textos, imágenes, gráficos y materiales educativos creados por CONEXIA están protegidos 
                  y no pueden ser reproducidos sin permiso.
                </p>
              </div>
            </div>
          </section>

          {/* Derechos de los usuarios */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Users className="text-conexia-green" size={28} />
              2. Derechos de los usuarios
            </h2>
            <div className="bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-lg p-6 border border-conexia-green/20">
              <p className="text-gray-700 mb-4 leading-relaxed">
                <strong>Tú eres el propietario de tu contenido.</strong> Cuando publicas en CONEXIA:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-semibold text-gray-800">Propiedad del contenido</p>
                    <p className="text-sm text-gray-600">
                      Mantienes todos los derechos sobre tu perfil, portafolio, publicaciones y trabajos compartidos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-semibold text-gray-800">Licencia a CONEXIA</p>
                    <p className="text-sm text-gray-600">
                      Otorgas una licencia no exclusiva para mostrar y distribuir tu contenido en la plataforma
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-2xl">✂️</span>
                  <div>
                    <p className="font-semibold text-gray-800">Control de tu contenido</p>
                    <p className="text-sm text-gray-600">
                      Puedes editar o eliminar tu contenido en cualquier momento desde tu cuenta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Uso permitido */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FileCheck className="text-conexia-green" size={28} />
              3. Uso permitido del contenido
            </h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-800">Visualización personal</p>
                  <p className="text-sm text-gray-600">Navegar y ver el contenido para tu uso personal</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-800">Compartir enlaces</p>
                  <p className="text-sm text-gray-600">Compartir enlaces a perfiles o servicios de CONEXIA</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-800">Citas con atribución</p>
                  <p className="text-sm text-gray-600">Citar contenido dando crédito al autor original y a CONEXIA</p>
                </div>
              </div>
            </div>
          </section>

          {/* Uso prohibido */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <AlertOctagon className="text-red-500" size={28} />
              4. Uso prohibido del contenido
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700 mb-3 font-semibold">Está estrictamente prohibido:</p>
              <div className="grid gap-2">
                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-red-500 text-xl">✗</span>
                  <p className="text-sm text-gray-700">
                    Copiar, reproducir o distribuir contenido sin autorización del propietario
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-red-500 text-xl">✗</span>
                  <p className="text-sm text-gray-700">
                    Usar el logotipo o marca CONEXIA para fines comerciales sin permiso
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-red-500 text-xl">✗</span>
                  <p className="text-sm text-gray-700">
                    Extraer datos mediante scraping, bots o herramientas automatizadas
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-red-500 text-xl">✗</span>
                  <p className="text-sm text-gray-700">
                    Crear trabajos derivados basados en el diseño o funcionalidad de CONEXIA
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-red-500 text-xl">✗</span>
                  <p className="text-sm text-gray-700">
                    Vender, sublicenciar o transferir contenido de otros usuarios
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Denuncias */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Denuncia de infracción de derechos</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <p className="text-gray-700 mb-3 leading-relaxed">
                Si crees que tu contenido ha sido usado sin autorización en CONEXIA, puedes presentar 
                una denuncia proporcionando:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Identificación del contenido protegido por derechos de autor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Ubicación del material infractor en la plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Tu información de contacto y firma electrónica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">→</span>
                  <span>Declaración de buena fe y veracidad de la información</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-white rounded border border-yellow-300">
                <p className="text-sm text-gray-700">
                  <strong>Email para denuncias:</strong> <span className="text-conexia-green">legal@conexia.com</span>
                </p>
              </div>
            </div>
          </section>

          {/* Medidas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Medidas ante infracciones</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                CONEXIA se toma muy en serio las infracciones de derechos de autor. Ante violaciones confirmadas:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-1">⚠️ Primera infracción</p>
                  <p className="text-sm text-gray-600">Advertencia y eliminación del contenido</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-1">🚫 Reincidencia</p>
                  <p className="text-sm text-gray-600">Suspensión temporal o permanente de la cuenta</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-lg p-6 border border-conexia-green/20">
            <h2 className="text-xl font-bold text-gray-800 mb-3">¿Preguntas sobre derechos?</h2>
            <p className="text-gray-700 mb-4">
              Para consultas sobre derechos de autor o propiedad intelectual, contáctanos.
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
