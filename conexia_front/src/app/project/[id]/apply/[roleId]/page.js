'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { applyToProjectRole, getMyPostulationsByProjectAndRole, cancelPostulation, createCancelledPostulation } from '@/service/postulations/postulationService';
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
  const [hasExistingPostulation, setHasExistingPostulation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
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
          
          // NUEVA REGLA: No puede volver a postularse si ya existe CUALQUIER postulación previa
          if (postulations && postulations.length > 0) {
            const lastPostulation = postulations[0]; // La más reciente
            const statusCode = lastPostulation.status?.code?.toLowerCase() || '';
            const statusName = lastPostulation.status?.name || 'en proceso';
            
            let message = '';
            if (statusCode === 'rechazada' || statusCode === 'rejected') {
              message = `Tu postulación anterior fue rechazada. No puedes volver a postularte a este rol.`;
            } else if (statusCode === 'aceptada' || statusCode === 'accepted') {
              message = `Tu postulación fue aceptada. Ya formas parte de este rol.`;
            } else if (statusCode === 'cancelada' || statusCode === 'cancelled') {
              message = `Cancelaste tu postulación anterior. No puedes volver a postularte a este rol.`;
            } else if (statusCode === 'expirada' || statusCode === 'expired') {
              message = `Tu postulación anterior expiró. No puedes volver a postularte a este rol.`;
            } else if (statusCode === 'pendiente' || statusCode === 'pending' || statusCode === 'activo' || statusCode === 'active') {
              message = `Ya tienes una postulación ${statusName} para este rol.`;
            } else {
              message = `Ya te postulaste anteriormente a este rol. No puedes volver a postularte.`;
            }
            
            setHasExistingPostulation(true);
            setToast({ 
              type: 'error', 
              message: message
            });
            
            // Redirigir inmediatamente al detalle del proyecto
            setLoading(false);
            setTimeout(() => {
              router.push(`/project/${projectId}`);
            }, 2000);
            return; // Detener la carga del proyecto
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
    const errors = {};
    
    // Detectar si es PARTNER o INVESTOR por el título del rol
    const isPartnerRole = applicationType === 'PARTNER' || 
                         applicationTypes.includes('PARTNER') ||
                         role.title?.toLowerCase().includes('socio');
    
    const isInvestorRole = applicationType === 'INVESTOR' || 
                          applicationTypes.includes('INVESTOR') ||
                          role.title?.toLowerCase().includes('inversor');

    // Verificar si ya tiene CUALQUIER postulación previa (nueva regla)
    if (existingPostulations && existingPostulations.length > 0) {
      const lastPostulation = existingPostulations[0];
      const statusCode = lastPostulation.status?.code?.toLowerCase() || '';
      const statusName = lastPostulation.status?.name || 'en proceso';
      
      let message = '';
      if (statusCode === 'cancelada' || statusCode === 'cancelled') {
        message = `Cancelaste tu postulación anterior. No puedes volver a postularte a este rol.`;
      } else if (statusCode === 'rechazada' || statusCode === 'rejected') {
        message = `Tu postulación anterior fue rechazada. No puedes volver a postularte a este rol.`;
      } else if (statusCode === 'aceptada' || statusCode === 'accepted') {
        message = `Tu postulación fue aceptada. Ya formas parte de este rol.`;
      } else if (statusCode === 'expirada' || statusCode === 'expired') {
        message = `Tu postulación anterior expiró. No puedes volver a postularte a este rol.`;
      } else {
        message = `Ya tienes una postulación ${statusName} para este rol. No puedes volver a postularte.`;
      }
      
      setToast({ 
        type: 'error', 
        message: message
      });
      return false;
    }

    // Validar CV si es requerido (para CV, PARTNER, INVESTOR)
    if ((applicationTypes.includes('CV') || applicationType === 'CV' || isPartnerRole || isInvestorRole) && !applicationData.cv) {
      errors.cv = 'Debes subir tu CV';
    }

    // Validar respuestas si hay preguntas
    if (applicationTypes.includes('QUESTIONS') && role.questions) {
      for (const question of role.questions) {
        const answer = applicationData.answers.find(a => a.questionId === question.id);
        if (!answer || (question.questionType === 'OPEN' && !answer.answerText?.trim()) || 
            (question.questionType === 'MULTIPLE_CHOICE' && !answer.optionId)) {
          errors[`question_${question.id}`] = 'Este campo es requerido';
        }
      }
    }

    // Validar campos de socio
    if (isPartnerRole) {
      if (!applicationData.partnerDescription?.trim()) {
        errors.partnerDescription = 'La descripción como socio es requerida';
      }
    }

    // Validar campos de inversor
    if (isInvestorRole) {
      if (!applicationData.investorMessage?.trim()) {
        errors.investorMessage = 'El mensaje de inversión es requerido';
      }
      if (!applicationData.investorAmount || applicationData.investorAmount <= 0) {
        errors.investorAmount = 'El monto de inversión es requerido y debe ser mayor a 0';
      }
    }

    // Para evaluación técnica, solo validamos que se entienda que se creará después
    if (applicationTypes.includes('EVALUATION')) {
      // La evaluación técnica se envía después, no requiere validación aquí
      console.log('Se creará una evaluación técnica pendiente');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      
      console.log('Resultado de la postulación:', result);

      if (result.success) {
        // Si hay evaluación técnica, redirigir directamente a la página de evaluación
        const hasEvaluation = applicationTypes.includes('EVALUATION') || 
                             applicationType === 'EVALUATION' || 
                             applicationType === 'MIXED';
        
        // Extraer el ID de la postulación (puede venir como postulationId, id, o dentro de data)
        const postulationId = result.postulationId || result.id || result.data?.postulationId || result.data?.id;
        
        console.log('hasEvaluation:', hasEvaluation);
        console.log('postulationId:', postulationId);
        console.log('role.evaluation:', role.evaluation);
        
        if (hasEvaluation && postulationId && role.evaluation) {
          console.log('Redirigiendo a evaluación:', `/project/${projectId}/evaluation/${postulationId}`);
          router.push(`/project/${projectId}/evaluation/${postulationId}?from=apply`);
          return; // Importante: salir aquí para evitar el timeout
        } else {
          setToast({ type: 'success', message: 'Postulación enviada correctamente' });
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

  if (!project || !role || hasExistingPostulation) {
    return (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
            {hasExistingPostulation ? (
              <>
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No puedes postularte</h2>
                <p className="text-gray-600 mb-4">Ya tienes una postulación para este rol.</p>
                <Button
                  onClick={() => router.push(`/project/${projectId}`)}
                  className="bg-conexia-green hover:bg-conexia-green/90"
                >
                  Volver al proyecto
                </Button>
              </>
            ) : (
              <div className="text-red-600">Proyecto o rol no encontrado</div>
            )}
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
                  onChange={(e) => {
                    handleFileChange(e, 'cv');
                    if (fieldErrors.cv) {
                      setFieldErrors(prev => ({...prev, cv: undefined}));
                    }
                  }}
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0 file:text-sm file:font-semibold
                            file:bg-conexia-green file:text-white hover:file:bg-conexia-green/90 ${
                              fieldErrors.cv ? 'border border-red-500 rounded-lg' : ''
                            }`}
                />
                {fieldErrors.cv && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.cv}</p>
                )}
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
                    <div key={question.id || index} className={`border rounded-lg p-4 ${
                      fieldErrors[`question_${question.id}`] ? 'border-red-500' : 'border-gray-200'
                    }`}>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {question.questionText}
                      </label>
                      
                      {question.questionType === 'OPEN' ? (
                        <>
                          <InputField
                            multiline
                            rows={3}
                            placeholder="Escribe tu respuesta..."
                            value={applicationData.answers.find(a => a.questionId === question.id)?.answerText || ''}
                            onChange={(e) => {
                              handleAnswerChange(question.id, e.target.value, 'text');
                              if (fieldErrors[`question_${question.id}`]) {
                                setFieldErrors(prev => ({...prev, [`question_${question.id}`]: undefined}));
                              }
                            }}
                          />
                          {fieldErrors[`question_${question.id}`] && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors[`question_${question.id}`]}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option.id}
                                  checked={applicationData.answers.find(a => a.questionId === question.id)?.optionId === option.id}
                                  onChange={(e) => {
                                    handleAnswerChange(question.id, parseInt(e.target.value), 'option');
                                    if (fieldErrors[`question_${question.id}`]) {
                                      setFieldErrors(prev => ({...prev, [`question_${question.id}`]: undefined}));
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm">{option.optionText}</span>
                              </label>
                            ))}
                          </div>
                          {fieldErrors[`question_${question.id}`] && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors[`question_${question.id}`]}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
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
                  onChange={(e) => {
                    setApplicationData(prev => ({...prev, partnerDescription: e.target.value}));
                    if (fieldErrors.partnerDescription) {
                      setFieldErrors(prev => ({...prev, partnerDescription: undefined}));
                    }
                  }}
                  className={fieldErrors.partnerDescription ? 'border-red-500' : ''}
                />
                {fieldErrors.partnerDescription && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.partnerDescription}</p>
                )}
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
                    onChange={(e) => {
                      setApplicationData(prev => ({...prev, investorMessage: e.target.value}));
                      if (fieldErrors.investorMessage) {
                        setFieldErrors(prev => ({...prev, investorMessage: undefined}));
                      }
                    }}
                    className={fieldErrors.investorMessage ? 'border-red-500' : ''}
                  />
                  {fieldErrors.investorMessage && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.investorMessage}</p>
                  )}
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
                    onChange={(e) => {
                      setApplicationData(prev => ({...prev, investorAmount: e.target.value}));
                      if (fieldErrors.investorAmount) {
                        setFieldErrors(prev => ({...prev, investorAmount: undefined}));
                      }
                    }}
                    className={fieldErrors.investorAmount ? 'border-red-500' : ''}
                  />
                  {fieldErrors.investorAmount && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.investorAmount}</p>
                  )}
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
                onClick={() => setShowCancelModal(true)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-conexia-green hover:bg-conexia-green/90"
              >
                {submitting 
                  ? 'Enviando...' 
                  : (role?.applicationTypes?.includes('EVALUATION') || 
                     role?.applicationType === 'EVALUATION' || 
                     role?.applicationType === 'MIXED')
                    ? 'Continuar con prueba técnica'
                    : 'Enviar Postulación'
                }
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Estás seguro de cancelar?
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-700">
                Si cancelas esta postulación:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>No podrás volver a postularte a este rol</li>
                <li>La postulación quedará en estado <span className="font-semibold">cancelada</span></li>
                <li>Perderás todo el progreso realizado en este formulario</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Volver al formulario
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    
                    // TODO: Cuando el backend implemente el endpoint para postulaciones canceladas,
                    // descomentar esta línea:
                    // await createCancelledPostulation(parseInt(projectId), parseInt(roleId));
                    
                    // Por ahora, marcar como cancelado solo en localStorage
                    const viewedRolesKey = `project_${projectId}_viewed_roles`;
                    const viewedRoles = JSON.parse(localStorage.getItem(viewedRolesKey) || '[]');
                    if (!viewedRoles.includes(parseInt(roleId))) {
                      viewedRoles.push(parseInt(roleId));
                      localStorage.setItem(viewedRolesKey, JSON.stringify(viewedRoles));
                    }
                    
                    setShowCancelModal(false);
                    setToast({ type: 'success', message: 'Postulación cancelada correctamente' });
                    
                    setTimeout(() => {
                      router.push(`/project/${projectId}`);
                    }, 2000);
                  } catch (error) {
                    console.error('Error al cancelar:', error);
                    setShowCancelModal(false);
                    setToast({ type: 'error', message: error.message || 'Error al cancelar la postulación' });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? 'Cancelando...' : 'Cancelar postulación'}
              </Button>
            </div>
          </div>
        </div>
      )}

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