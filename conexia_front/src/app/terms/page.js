'use client';

import { Shield, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con efecto */}
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
            <Shield size={48} className="text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              Condiciones de Uso
            </h1>
          </div>
          <p className="text-lg text-white/90 drop-shadow">
            Términos y condiciones para el uso de la plataforma CONEXIA
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
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-conexia-green" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">1. Introducción</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                Bienvenido a <strong>CONEXIA</strong>, la plataforma profesional que conecta talentos con oportunidades. 
                Al acceder y utilizar nuestros servicios, aceptas estar sujeto a estos términos y condiciones. 
                Te recomendamos leer detenidamente este documento antes de usar la plataforma.
              </p>
            </div>
          </section>

          {/* Aceptación de términos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <CheckCircle className="text-conexia-green" size={28} />
              2. Aceptación de Términos
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Al crear una cuenta o utilizar cualquier servicio de CONEXIA, confirmas que:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold mt-1">•</span>
                  <span>Has leído, comprendido y aceptado estos términos y condiciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold mt-1">•</span>
                  <span>Eres mayor de 18 años o cuentas con el consentimiento de un tutor legal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold mt-1">•</span>
                  <span>Proporcionarás información veraz y actualizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-conexia-green font-bold mt-1">•</span>
                  <span>Cumplirás con todas las leyes y regulaciones aplicables</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Uso de la plataforma */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Users className="text-conexia-green" size={28} />
              3. Uso de la Plataforma
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">3.1 Cuentas de Usuario</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Cada usuario es responsable de mantener la confidencialidad de su cuenta y contraseña. 
                  No está permitido compartir credenciales ni crear múltiples cuentas para evadir restricciones.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">3.2 Conducta Profesional</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Los usuarios deben mantener un comportamiento profesional y respetuoso. Está prohibido 
                  el acoso, discriminación, publicación de contenido ofensivo o cualquier actividad que 
                  perjudique a otros usuarios o a la plataforma.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">3.3 Servicios y Transacciones</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  CONEXIA facilita la conexión entre profesionales y clientes. Los acuerdos de servicio, 
                  precios y condiciones son establecidos directamente entre las partes. La plataforma 
                  actúa como intermediario para garantizar transacciones seguras.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibiciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={28} />
              4. Actividades Prohibidas
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700 mb-3">Está estrictamente prohibido:</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span>Utilizar la plataforma para actividades ilegales o fraudulentas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span>Intentar acceder sin autorización a cuentas de otros usuarios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span>Publicar contenido falso, engañoso o que infrinja derechos de terceros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span>Realizar spam, phishing o distribuir malware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span>Evadir o manipular el sistema de pagos y comisiones de la plataforma</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Propiedad intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed">
              Todos los contenidos, marcas, logotipos y diseños de CONEXIA son propiedad exclusiva 
              de la plataforma o de sus licenciantes. El contenido creado por los usuarios permanece 
              bajo su propiedad, pero otorgan a CONEXIA una licencia para mostrarlo en la plataforma.
            </p>
          </section>

          {/* Limitación de responsabilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Limitación de Responsabilidad</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed text-sm">
                CONEXIA proporciona la plataforma "tal cual" y no garantiza resultados específicos. 
                No somos responsables de disputas entre usuarios, calidad de servicios prestados, 
                o daños derivados del uso de la plataforma, salvo lo establecido por la ley aplicable.
              </p>
            </div>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              serán notificados a través de la plataforma y entrarán en vigor tras su publicación.
            </p>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-br from-conexia-green/10 to-blue-50 rounded-lg p-6 border border-conexia-green/20">
            <h2 className="text-xl font-bold text-gray-800 mb-3">¿Preguntas sobre estos términos?</h2>
            <p className="text-gray-700 mb-4">
              Si tienes dudas o necesitas más información, nuestro equipo está disponible para ayudarte.
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
