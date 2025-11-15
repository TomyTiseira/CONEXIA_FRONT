'use client';

import { useState } from 'react';
import { RoleApplicationModal } from '@/components/project/postulation';
import { APPLICATION_TYPES } from '@/components/project/roles/ProjectRolesManager';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

/**
 * Página de demostración del flujo de postulación con roles
 * Esta página muestra el diseño del nuevo sistema de postulación
 */
export default function PostulationDemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  // Datos de ejemplo para demostración
  const mockProject = {
    title: 'Plataforma de E-learning para Profesionales',
    roles: [
      {
        id: 1,
        title: 'Desarrollador Full Stack',
        description: 'Buscamos un desarrollador con experiencia en React y Node.js para desarrollar la plataforma web principal.',
        vacancies: 2,
        applicationType: APPLICATION_TYPES.CV_ONLY,
      },
      {
        id: 2,
        title: 'Diseñador UX/UI',
        description: 'Necesitamos un diseñador creativo para crear interfaces intuitivas y atractivas.',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.CUSTOM_QUESTIONS,
        questions: [
          {
            question: '¿Cuál es tu experiencia previa en diseño de plataformas educativas?',
            type: 'open'
          },
          {
            question: '¿Qué herramientas de diseño utilizas principalmente?',
            type: 'multiple',
            options: [
              { text: 'Figma', isCorrect: false },
              { text: 'Adobe XD', isCorrect: false },
              { text: 'Sketch', isCorrect: false },
              { text: 'Todas las anteriores', isCorrect: false },
            ]
          },
          {
            question: '¿Cómo abordarías el diseño de una experiencia de usuario para estudiantes de diferentes edades?',
            type: 'open'
          }
        ]
      },
      {
        id: 3,
        title: 'Desarrollador Backend',
        description: 'Buscamos un experto en arquitectura de microservicios y bases de datos.',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.TECHNICAL_EVALUATION,
        evaluation: {
          description: 'Diseña una arquitectura de base de datos para un sistema de gestión de cursos que soporte: usuarios, cursos, lecciones, evaluaciones y certificados. Incluye diagramas ER y explica tus decisiones de diseño.',
          link: 'https://docs.google.com/document/d/ejemplo-evaluacion',
          file: null
        }
      },
      {
        id: 4,
        title: 'Tech Lead',
        description: 'Líder técnico con visión estratégica para guiar el desarrollo del proyecto.',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.MIXED,
        questions: [
          {
            question: '¿Cuál es tu filosofía de liderazgo técnico?',
            type: 'open'
          },
          {
            question: '¿Cuántos años de experiencia tienes liderando equipos?',
            type: 'multiple',
            options: [
              { text: 'Menos de 1 año', isCorrect: false },
              { text: '1-3 años', isCorrect: false },
              { text: '3-5 años', isCorrect: false },
              { text: 'Más de 5 años', isCorrect: false },
            ]
          }
        ],
        evaluation: {
          description: 'Propón una estrategia de desarrollo ágil para un equipo distribuido de 8 personas trabajando en este proyecto. Incluye metodologías, herramientas y procesos.',
          link: null,
          file: null
        }
      },
      {
        id: 5,
        title: 'Inversor',
        description: 'Buscamos inversores estratégicos que puedan aportar capital y conexiones en el sector educativo.',
        vacancies: 3,
        applicationType: APPLICATION_TYPES.INVESTOR,
      },
      {
        id: 6,
        title: 'Socio Cofundador',
        description: 'Persona con visión emprendedora y habilidades complementarias para ser socio a largo plazo.',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.PARTNER,
      }
    ]
  };

  const handleSubmitApplication = (applicationData) => {
    console.log('📤 Datos de postulación enviados:', applicationData);
    
    // Simular envío al backend
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      setToast({ 
        visible: true, 
        type: 'success', 
        message: `¡Postulación enviada correctamente al rol "${mockProject.roles.find(r => r.id === applicationData.roleId)?.title}"!` 
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                DEMO / DISEÑO FRONTEND
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sistema de Postulación por Roles
              </h1>
              <p className="text-gray-600">
                Esta página demuestra el diseño del nuevo flujo de postulación donde los usuarios pueden elegir entre diferentes roles con distintos tipos de aplicación.
              </p>
            </div>
          </div>
        </div>

        {/* Proyecto de ejemplo */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{mockProject.title}</h2>
          <p className="text-gray-600 mb-6">
            Este proyecto de ejemplo tiene {mockProject.roles.length} roles disponibles con diferentes tipos de postulación.
          </p>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-900">Roles disponibles:</h3>
            {mockProject.roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{role.title}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-conexia-green/10 text-conexia-green">
                        {role.vacancies} {role.vacancies === 1 ? 'vacante' : 'vacantes'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                        {role.applicationType === APPLICATION_TYPES.CV_ONLY && '📄 Solo CV'}
                        {role.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS && '❓ Preguntas personalizadas'}
                        {role.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION && '💻 Evaluación técnica'}
                        {role.applicationType === APPLICATION_TYPES.MIXED && '🔀 Mixto'}
                        {role.applicationType === APPLICATION_TYPES.INVESTOR && '💰 Inversor'}
                        {role.applicationType === APPLICATION_TYPES.PARTNER && '🤝 Socio'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            className="w-full"
          >
            Postularse al proyecto
          </Button>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Sobre esta demo</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• El modal muestra todos los roles disponibles</li>
            <li>• Al seleccionar un rol, se abre un formulario dinámico adaptado al tipo de postulación</li>
            <li>• Los tipos de postulación incluyen: CV, Preguntas, Evaluación Técnica, Mixto, Inversor y Socio</li>
            <li>• El formulario valida que todos los campos requeridos estén completos</li>
            <li>• Los datos se muestran en la consola del navegador al enviar</li>
            <li>• Esta es solo la UI - la integración con backend se hará después</li>
          </ul>
        </div>
      </div>

      {/* Modal de postulación */}
      <RoleApplicationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setLoading(false);
        }}
        projectTitle={mockProject.title}
        roles={mockProject.roles}
        loading={loading}
        error={null}
        onSubmit={handleSubmitApplication}
      />

      {/* Toast de confirmación */}
      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
    </div>
  );
}
