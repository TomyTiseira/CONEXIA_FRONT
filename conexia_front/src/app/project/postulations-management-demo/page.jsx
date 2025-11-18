'use client';

import { useState } from 'react';
import RoleBasedPostulationsPanel from '@/components/project/postulations/RoleBasedPostulationsPanel';
import { APPLICATION_TYPES } from '@/components/project/roles/ProjectRolesManager';
import Toast from '@/components/ui/Toast';

/**
 * Página de demostración del panel de gestión de postulaciones
 */
export default function PostulationsManagementDemoPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  // Datos de ejemplo
  const mockData = {
    projectTitle: 'Plataforma de E-learning para Profesionales',
    roles: [
      {
        id: 1,
        title: 'Desarrollador Full Stack',
        description: 'Desarrollo de la plataforma web principal',
        vacancies: 2,
        applicationType: APPLICATION_TYPES.CV_ONLY,
      },
      {
        id: 2,
        title: 'Diseñador UX/UI',
        description: 'Diseño de interfaces intuitivas',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.CUSTOM_QUESTIONS,
        questions: [
          {
            question: '¿Cuál es tu experiencia en diseño de plataformas educativas?',
            type: 'open'
          },
          {
            question: '¿Qué herramientas utilizas?',
            type: 'multiple',
            options: [
              { text: 'Figma', isCorrect: true },
              { text: 'Adobe XD', isCorrect: false },
              { text: 'Sketch', isCorrect: false },
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Desarrollador Backend',
        description: 'Arquitectura de microservicios',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.TECHNICAL_EVALUATION,
        evaluation: {
          description: 'Diseña una arquitectura de base de datos para el sistema de gestión de cursos.',
          link: 'https://docs.google.com/document/d/ejemplo',
          file: null
        }
      },
      {
        id: 4,
        title: 'Tech Lead',
        description: 'Líder técnico del proyecto',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.MIXED,
        questions: [
          {
            question: '¿Cuál es tu filosofía de liderazgo técnico?',
            type: 'open'
          }
        ],
        evaluation: {
          description: 'Propón una estrategia de desarrollo ágil para el equipo.',
          link: null,
          file: null
        }
      },
      {
        id: 5,
        title: 'Inversor',
        description: 'Inversores estratégicos para el proyecto',
        vacancies: 3,
        applicationType: APPLICATION_TYPES.INVESTOR,
      },
      {
        id: 6,
        title: 'Socio Cofundador',
        description: 'Socio a largo plazo',
        vacancies: 1,
        applicationType: APPLICATION_TYPES.PARTNER,
      }
    ],
    postulations: [
      // Rol 1: Desarrollador Full Stack
      {
        id: 1,
        roleId: 1,
        applicantName: 'Juan Pérez',
        applicantEmail: 'juan.perez@email.com',
        status: 'pending',
        createdAt: '2025-11-10T10:30:00',
        cvFile: { name: 'CV_Juan_Perez.pdf', size: 245000 }
      },
      {
        id: 2,
        roleId: 1,
        applicantName: 'María González',
        applicantEmail: 'maria.gonzalez@email.com',
        status: 'approved',
        createdAt: '2025-11-09T14:20:00',
        cvFile: { name: 'CV_Maria_Gonzalez.pdf', size: 189000 }
      },
      {
        id: 3,
        roleId: 1,
        applicantName: 'Carlos Rodríguez',
        applicantEmail: 'carlos.rodriguez@email.com',
        status: 'pending',
        createdAt: '2025-11-11T09:15:00',
        cvFile: { name: 'CV_Carlos_Rodriguez.pdf', size: 312000 }
      },
      
      // Rol 2: Diseñador UX/UI
      {
        id: 4,
        roleId: 2,
        applicantName: 'Ana Martínez',
        applicantEmail: 'ana.martinez@email.com',
        status: 'pending',
        createdAt: '2025-11-10T16:45:00',
        cvFile: { name: 'CV_Ana_Martinez.pdf', size: 267000 },
        answers: {
          0: 'Tengo 5 años de experiencia diseñando plataformas educativas para universidades y empresas. He trabajado en proyectos como EduTech Academy y LearnHub Pro.',
          1: 'Figma'
        }
      },
      {
        id: 5,
        roleId: 2,
        applicantName: 'Luis Fernández',
        applicantEmail: 'luis.fernandez@email.com',
        status: 'rejected',
        createdAt: '2025-11-08T11:30:00',
        cvFile: { name: 'CV_Luis_Fernandez.pdf', size: 198000 },
        answers: {
          0: 'Tengo experiencia básica en diseño web.',
          1: 'Sketch'
        },
        feedback: 'La experiencia en plataformas educativas es insuficiente para las necesidades del proyecto.'
      },

      // Rol 3: Desarrollador Backend
      {
        id: 6,
        roleId: 3,
        applicantName: 'Pedro Sánchez',
        applicantEmail: 'pedro.sanchez@email.com',
        status: 'pending',
        createdAt: '2025-11-11T13:20:00',
        cvFile: { name: 'CV_Pedro_Sanchez.pdf', size: 289000 },
        evaluationFile: { name: 'Arquitectura_DB.pdf', extension: 'pdf', size: 456000 }
      },

      // Rol 4: Tech Lead
      {
        id: 7,
        roleId: 4,
        applicantName: 'Laura Díaz',
        applicantEmail: 'laura.diaz@email.com',
        status: 'approved',
        createdAt: '2025-11-09T10:00:00',
        cvFile: { name: 'CV_Laura_Diaz.pdf', size: 334000 },
        answers: {
          0: 'Mi filosofía se basa en el liderazgo servicial, donde el tech lead es un facilitador que empodera al equipo. Creo en la comunicación abierta, la toma de decisiones colaborativa y en dar autonomía a cada desarrollador mientras mantengo la visión técnica del proyecto.'
        },
        evaluationFile: { name: 'Estrategia_Agil.docx', extension: 'docx', size: 234000 }
      },

      // Rol 5: Inversor
      {
        id: 8,
        roleId: 5,
        applicantName: 'Roberto Gómez',
        applicantEmail: 'roberto.gomez@email.com',
        status: 'pending',
        createdAt: '2025-11-10T15:30:00',
        cvFile: { name: 'CV_Roberto_Gomez.pdf', size: 223000 },
        investmentAmount: 50000,
        investmentDescription: 'Estoy interesado en invertir $50,000 USD a cambio del 10% de equity. Tengo experiencia en el sector EdTech y puedo aportar conexiones con instituciones educativas. Me gustaría participar activamente en decisiones estratégicas del negocio.'
      },
      {
        id: 9,
        roleId: 5,
        applicantName: 'Patricia López',
        applicantEmail: 'patricia.lopez@email.com',
        status: 'pending',
        createdAt: '2025-11-11T11:45:00',
        cvFile: { name: 'CV_Patricia_Lopez.pdf', size: 198000 },
        investmentAmount: 30000,
        investmentDescription: 'Propongo una inversión de $30,000 USD en dos tramos. Tengo experiencia en marketing digital para plataformas online y podría ayudar en la estrategia de adquisición de usuarios.'
      },

      // Rol 6: Socio Cofundador
      {
        id: 10,
        roleId: 6,
        applicantName: 'Miguel Torres',
        applicantEmail: 'miguel.torres@email.com',
        status: 'pending',
        createdAt: '2025-11-09T17:00:00',
        cvFile: { name: 'CV_Miguel_Torres.pdf', size: 276000 },
        partnerContribution: 'Soy especialista en desarrollo de negocios con 8 años de experiencia en startups tecnológicas. Puedo aportar:\n\n- Network con inversores y aceleradoras\n- Experiencia en fundraising (he levantado +$2M en proyectos anteriores)\n- Conocimientos en estrategia de go-to-market\n- Disponibilidad full-time\n- Habilidades en ventas B2B\n\nBusco una participación del 20-25% y compromiso a largo plazo con el proyecto.'
      }
    ]
  };

  const handleApprove = async (applicationId) => {
    console.log('✅ Aprobar postulación:', applicationId);
    setLoading(true);
    
    // Simular llamada API
    setTimeout(() => {
      setLoading(false);
      setToast({ 
        visible: true, 
        type: 'success', 
        message: '¡Postulación aprobada correctamente!' 
      });
    }, 1500);
  };

  const handleReject = async (applicationId, feedback) => {
    console.log('❌ Rechazar postulación:', applicationId);
    console.log('📝 Feedback:', feedback);
    setLoading(true);
    
    // Simular llamada API
    setTimeout(() => {
      setLoading(false);
      setToast({ 
        visible: true, 
        type: 'info', 
        message: 'Postulación rechazada. El candidato ha sido notificado.' 
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto mb-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
            DEMO / DISEÑO FRONTEND
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Gestión de Postulaciones
          </h1>
          <p className="text-gray-600">
            Esta página demuestra el diseño del panel donde los dueños de proyectos pueden gestionar las postulaciones agrupadas por rol.
          </p>
        </div>

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Características</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Agrupación por roles:</strong> Las postulaciones se organizan por el rol al que aplican</li>
            <li>• <strong>Resumen visual:</strong> Cards con estadísticas de cada rol (total, pendientes, aprobados, rechazados)</li>
            <li>• <strong>Filtros:</strong> Búsqueda por nombre/email y filtro por estado</li>
            <li>• <strong>Detalle completo:</strong> Modal que muestra toda la información según el tipo de postulación</li>
            <li>• <strong>Acciones:</strong> Aprobar o rechazar con feedback</li>
            <li>• <strong>Indicadores visuales:</strong> Para respuestas correctas/incorrectas en preguntas de opción múltiple</li>
          </ul>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total Postulaciones</p>
            <p className="text-3xl font-bold text-gray-900">{mockData.postulations.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-6">
            <p className="text-sm text-yellow-700 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-800">
              {mockData.postulations.filter(p => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-6">
            <p className="text-sm text-green-700 mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-green-800">
              {mockData.postulations.filter(p => p.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-6">
            <p className="text-sm text-red-700 mb-1">Rechazadas</p>
            <p className="text-3xl font-bold text-red-800">
              {mockData.postulations.filter(p => p.status === 'rejected').length}
            </p>
          </div>
        </div>
      </div>

      {/* Panel principal */}
      <div className="max-w-7xl mx-auto">
        <RoleBasedPostulationsPanel
          projectTitle={mockData.projectTitle}
          roles={mockData.roles}
          postulations={mockData.postulations}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      </div>

      {/* Toast */}
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
