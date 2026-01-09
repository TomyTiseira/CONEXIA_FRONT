'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { applyToProjectRole, getMyPostulationsByProjectAndRole } from '@/service/postulations/postulationService';
import Navbar from '@/components/navbar/Navbar';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import Toast from '@/components/ui/Toast';
import { config } from '@/config';

export default function ProjectApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [existingPostulations, setExistingPostulations] = useState([]);
  const [applicationData, setApplicationData] = useState({
    cv: null,
    answers: [],
    partnerDescription: '',
    investorMessage: '',
    investorAmount: ''
  });

  const projectId = params.id;
  const roleId = params.roleId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadProjectData = async () => {
      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        
        const selectedRole = projectData.roles?.find(r => String(r.id) === String(roleId));
        if (!selectedRole) {
          setToast({ type: 'error', message: 'Rol no encontrado' });
          return;
        }
        
        setRole(selectedRole);

        // Verificar si ya tiene postulaciones a este rol
        try {
          const postulations = await getMyPostulationsByProjectAndRole(projectId, roleId);
          setExistingPostulations(postulations);
          
          // Verificar si ya tiene una postulación activa, aceptada o pendiente
          const activePostulation = postulations.find(p => 
            ['activo', 'aceptada', 'pendiente'].includes(p.status?.code)
          );
          
          if (activePostulation) {
            setToast({ 
              type: 'warning', 
              message: `Ya tienes una postulación ${activePostulation.status.name} para este rol` 
            });
          }
        } catch (error) {
          console.error('Error checking postulations:', error);
        }

        // Inicializar respuestas si hay preguntas
        if (selectedRole.questions && selectedRole.questions.length > 0) {
          setApplicationData(prev => ({
            ...prev,
            answers: selectedRole.questions.map(q => ({
              questionId: q.id,
              answerText: q.questionType === 'OPEN' ? '' : null,
              optionId: q.questionType === 'MULTIPLE_CHOICE' ? null : null
            }))
          }));
        }
      } catch (error) {
        setToast({ type: 'error', message: 'Error al cargar los datos del proyecto' });
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, roleId, isAuthenticated, router]);

  const handleFileChange = (e, fileType = 'cv') => {
    const file = e.target.files?.[0];
    if (file) {
      setApplicationData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleAnswerChange = (questionId, value, type = 'text') => {
    setApplicationData(prev => ({
      ...prev,
      answers: prev.answers.map(answer => 
        answer.questionId === questionId 
          ? {
              ...answer,
              [type === 'text' ? 'answerText' : 'optionId']: value,
              [type === 'text' ? 'optionId' : 'answerText']: null
            }
          : answer
      )
    }));
  };

  const validateApplication = () => {
    const applicationTypes = role.applicationTypes || [];
    const applicationType = role.applicationType;
    
    // Detectar si es PARTNER o INVESTOR por el título del rol
    const isPartnerRole = applicationType === 'PARTNER' || 
                         applicationTypes.includes('PARTNER') ||
                         role.title?.toLowerCase().includes('socio');
    
    const isInvestorRole = applicationType === 'INVESTOR' || 
                          applicationTypes.includes('INVESTOR') ||
                          role.title?.toLowerCase().includes('inversor');

    // Verificar si ya tiene una postulación activa
    const activePostulation = existingPostulations.find(p => 
      ['activo', 'aceptada', 'pendiente'].includes(p.status?.code)
    );
    
    if (activePostulation) {
      setToast({ 
        type: 'error', 
        message: `Ya tienes una postulación ${activePostulation.status.name} para este rol` 
      });
      return false;
    }

    // Validar CV si es requerido (para CV, PARTNER, INVESTOR)
    if ((applicationTypes.includes('CV') || applicationType === 'CV' || isPartnerRole || isInvestorRole) && !applicationData.cv) {
      setToast({ type: 'error', message: 'Debes subir tu CV' });
      return false;
    }

    // Validar respuestas si hay preguntas
    if (applicationTypes.includes('QUESTIONS') && role.questions) {
      for (const question of role.questions) {
        const answer = applicationData.answers.find(a => a.questionId === question.id);
        if (!answer || (question.questionType === 'OPEN' && !answer.answerText?.trim()) || 
            (question.questionType === 'MULTIPLE_CHOICE' && !answer.optionId)) {
          setToast({ type: 'error', message: `Debes responder todas las preguntas` });
          return false;
        }
      }
    }

    // Validar campos de socio
    if (isPartnerRole) {
      if (!applicationData.partnerDescription?.trim()) {
        setToast({ type: 'error', message: 'La descripción como socio es requerida' });
        return false;
      }
    }

    // Validar campos de inversor
    if (isInvestorRole) {
      if (!applicationData.investorMessage?.trim()) {
        setToast({ type: 'error', message: 'El mensaje de inversión es requerido' });
        return false;
      }
      if (!applicationData.investorAmount || applicationData.investorAmount <= 0) {
        setToast({ type: 'error', message: 'El monto de inversión es requerido y debe ser mayor a 0' });
        return false;
      }
    }

    // Para evaluación técnica, solo validamos que se entienda que se creará después
    if (applicationTypes.includes('EVALUATION')) {
      // La evaluación técnica se envía después, no requiere validación aquí
      console.log('Se creará una evaluación técnica pendiente');
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateApplication()) return;

    setSubmitting(true);
    try {
      const applicationTypes = role.applicationTypes || [];
      const applicationType = role.applicationType;
      
      // Detectar si es PARTNER o INVESTOR por el título del rol
      const isPartnerRole = applicationType === 'PARTNER' || 
                           applicationTypes.includes('PARTNER') ||
                           role.title?.toLowerCase().includes('socio');
      
      const isInvestorRole = applicationType === 'INVESTOR' || 
                            applicationTypes.includes('INVESTOR') ||
                            role.title?.toLowerCase().includes('inversor');
      
      console.log('Debug - role:', role);
      console.log('Debug - isPartnerRole:', isPartnerRole);
      console.log('Debug - isInvestorRole:', isInvestorRole);
      console.log('Debug - applicationData:', applicationData);
      
      // Preparar datos de la postulación
      const postulationData = {
        projectId: parseInt(projectId),
        roleId: parseInt(roleId)
      };

      // Agregar CV si es requerido
      if ((applicationTypes.includes('CV') || applicationType === 'CV' || 
           isPartnerRole || isInvestorRole) && applicationData.cv) {
        postulationData.cv = applicationData.cv;
      }

      // Agregar respuestas si hay preguntas
      if (applicationTypes.includes('QUESTIONS') && applicationData.answers.length > 0) {
        // Filtrar solo las respuestas que tienen valor
        const validAnswers = applicationData.answers.filter(answer => 
          (answer.answerText && answer.answerText.trim()) || answer.optionId
        );
        postulationData.answers = validAnswers;
      }

      // Agregar datos de socio si aplica
      if (isPartnerRole) {
        postulationData.partnerDescription = applicationData.partnerDescription?.trim() || '';
        console.log('Debug - Agregado partnerDescription:', postulationData.partnerDescription);
      }

      // Agregar datos de inversor si aplica
      if (isInvestorRole) {
        postulationData.investorMessage = applicationData.investorMessage?.trim() || '';
        postulationData.investorAmount = parseInt(applicationData.investorAmount) || 0;
      }

      console.log('Datos de postulación a enviar:', postulationData);

      const result = await applyToProjectRole(postulationData);

      if (result.success) {
        setToast({ type: 'success', message: 'Postulación enviada correctamente' });
        
        // Si hay evaluación técnica, redirigir a la página de evaluación
        if (applicationTypes.includes('EVALUATION') && result.data?.postulationId) {
          setTimeout(() => {
            router.push(`/project/${projectId}/evaluation/${result.data.postulationId}`);
          }, 2000);
        } else {
          setTimeout(() => {
            router.push(`/project/${projectId}`);
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Error al enviar la postulación');
      }
    } catch (error) {
      console.error('Error al postularse:', error);
      
      // Mensajes personalizados según el tipo de error
      let errorMessage = 'No se pudo enviar tu postulación. Por favor, intenta nuevamente.';
      
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('already applied') || errorMsg.includes('ya postulado') || errorMsg.includes('ya te postulaste')) {
        errorMessage = 'Ya te has postulado anteriormente a este rol.';
      } else if (errorMsg.includes('project not found') || errorMsg.includes('proyecto no encontrado')) {
        errorMessage = 'El proyecto no está disponible en este momento.';
      } else if (errorMsg.includes('role not found') || errorMsg.includes('rol no encontrado')) {
        errorMessage = 'El rol no está disponible para postulación.';
      } else if (errorMsg.includes('cv required') || errorMsg.includes('cv requerido')) {
        errorMessage = 'Debes adjuntar tu CV para completar la postulación.';
      } else if (errorMsg.includes('file') || errorMsg.includes('archivo')) {
        errorMessage = 'Hubo un problema al cargar el archivo. Verifica que sea un PDF válido.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else if (errorMsg.includes('unauthorized') || errorMsg.includes('not authorized')) {
        errorMessage = 'No tienes permisos para postularte a este proyecto.';
      } else if (errorMsg.includes('banned') || errorMsg.includes('bloqueado')) {
        errorMessage = 'No puedes postularte a este proyecto en este momento.';
      } else if (errorMsg.includes('answers') || errorMsg.includes('questions') || errorMsg.includes('preguntas')) {
        errorMessage = 'Por favor, completa todas las preguntas requeridas.';
      } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
        errorMessage = 'Algunos datos ingresados no son válidos. Revisa el formulario.';
      }
      
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-conexia-green">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!project || !role) {
    return (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-600">Proyecto o rol no encontrado</div>
        </div>
      </div>
    );
  }

  const applicationTypes = role.applicationTypes || [];
  const applicationType = role.applicationType;
  
  // Detectar si es PARTNER o INVESTOR por el título del rol
  const isPartnerRole = applicationType === 'PARTNER' || 
                       applicationTypes.includes('PARTNER') ||
                       role.title?.toLowerCase().includes('socio');
  
  const isInvestorRole = applicationType === 'INVESTOR' || 
                        applicationTypes.includes('INVESTOR') ||
                        role.title?.toLowerCase().includes('inversor');

  return (
    <div className="min-h-screen bg-[#f3f9f8]">
      <Navbar />
      <div className="py-8 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-conexia-green mb-2">
              Postularme a: {role.title}
            </h1>
            <p className="text-gray-600">
              Proyecto: <span className="font-medium">{project.title}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tipos de postulación: {applicationTypes.map(type => {
                const labels = { 
                  'CV': 'CV', 
                  'QUESTIONS': 'Preguntas', 
                  'EVALUATION': 'Evaluación Técnica',
                  'PARTNER': 'Socio',
                  'INVESTOR': 'Inversor'
                };
                return labels[type] || type;
              }).join(', ')}
              {role.applicationType && !applicationTypes.length && (
                <span> {role.applicationType === 'PARTNER' ? 'Socio' : role.applicationType === 'INVESTOR' ? 'Inversor' : role.applicationType}</span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subida de CV */}
            {(applicationTypes.includes('CV') || isPartnerRole || isInvestorRole) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curriculum Vitae *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'cv')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0 file:text-sm file:font-semibold
                            file:bg-conexia-green file:text-white hover:file:bg-conexia-green/90"
                  required
                />
                {applicationData.cv && (
                  <p className="text-sm text-green-600 mt-1">✓ {applicationData.cv.name}</p>
                )}
              </div>
            )}

            {/* Preguntas */}
            {applicationTypes.includes('QUESTIONS') && role.questions && role.questions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preguntas</h3>
                <div className="space-y-4">
                  {role.questions.map((question, index) => (
                    <div key={question.id || index} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {question.questionText}
                      </label>
                      
                      {question.questionType === 'OPEN' ? (
                        <InputField
                          multiline
                          rows={3}
                          placeholder="Escribe tu respuesta..."
                          value={applicationData.answers.find(a => a.questionId === question.id)?.answerText || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                          required
                        />
                      ) : (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={applicationData.answers.find(a => a.questionId === question.id)?.optionId === option.id}
                                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value), 'option')}
                                className="mr-2"
                                required
                              />
                              <span className="text-sm">{option.optionText}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluación técnica */}
            {applicationTypes.includes('EVALUATION') && role.evaluation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Evaluación Técnica</h3>
                <p className="text-blue-800 mb-3">{role.evaluation.description}</p>
                {role.evaluation.link && (
                  <p className="text-blue-700 text-sm mb-2">
                    <span className="font-medium">Enlace:</span>{' '}
                    <a href={role.evaluation.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                      {role.evaluation.link}
                    </a>
                  </p>
                )}
                {role.evaluation.fileUrl && (
                  <div className="text-blue-700 text-sm mb-2">
                    <span className="font-medium">Archivo adjunto:</span>{' '}
                    <a 
                      href={role.evaluation.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download={role.evaluation.fileName || 'evaluacion-tecnica.pdf'}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {role.evaluation.fileName || 'Descargar archivo de evaluación'}
                    </a>
                  </div>
                )}
                <p className="text-blue-700 text-sm font-medium">
                  Tienes {role.evaluation.days} días para completar esta evaluación después de postularte.
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  Al postularte, se creará una evaluación técnica en tu perfil donde podrás subir tu solución.
                </p>
              </div>
            )}

            {/* Campos adicionales para socio/inversor */}
            {isPartnerRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción como socio *
                </label>
                <InputField
                  multiline
                  rows={3}
                  placeholder="Describe qué puedes aportar como socio..."
                  value={applicationData.partnerDescription}
                  onChange={(e) => setApplicationData(prev => ({...prev, partnerDescription: e.target.value}))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe tus habilidades, experiencia y qué valor puedes aportar al proyecto
                </p>
              </div>
            )}

            {isInvestorRole && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de inversión *
                  </label>
                  <InputField
                    multiline
                    rows={3}
                    placeholder="Describe tu propuesta de inversión..."
                    value={applicationData.investorMessage}
                    onChange={(e) => setApplicationData(prev => ({...prev, investorMessage: e.target.value}))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Explica tu interés en invertir y tu experiencia
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de inversión *
                  </label>
                  <InputField
                    type="number"
                    placeholder="Monto en pesos"
                    value={applicationData.investorAmount}
                    onChange={(e) => setApplicationData(prev => ({...prev, investorAmount: e.target.value}))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa el monto que estás dispuesto a invertir
                  </p>
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/project/${projectId}`)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-conexia-green hover:bg-conexia-green/90"
              >
                {submitting ? 'Enviando...' : 'Enviar Postulación'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
          position="top-center"
          duration={4000}
        />
      )}
    </div>
  );
}