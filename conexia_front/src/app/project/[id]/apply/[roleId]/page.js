'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectById } from '@/service/projects/projectsFetch';
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

    // Validar CV si es requerido
    if (applicationTypes.includes('CV') && !applicationData.cv) {
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateApplication()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('roleId', roleId);

      const applicationTypes = role.applicationTypes || [];

      // Agregar CV si es requerido
      if (applicationTypes.includes('CV') && applicationData.cv) {
        formData.append('cv', applicationData.cv);
      }

      // Agregar respuestas si hay preguntas
      if (applicationTypes.includes('QUESTIONS') && applicationData.answers.length > 0) {
        // Filtrar solo las respuestas que tienen valor
        const validAnswers = applicationData.answers.filter(answer => 
          (answer.answerText && answer.answerText.trim()) || answer.optionId
        );
        formData.append('answers', JSON.stringify(validAnswers));
      }

      // Agregar datos de socio si aplica
      if (applicationData.partnerDescription?.trim()) {
        formData.append('partnerDescription', applicationData.partnerDescription);
      }

      // Agregar datos de inversor si aplica
      if (applicationData.investorMessage?.trim()) {
        formData.append('investorMessage', applicationData.investorMessage);
      }
      if (applicationData.investorAmount) {
        formData.append('investorAmount', applicationData.investorAmount);
      }

      const response = await fetch(`${config.API_URL}/postulations/apply`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setToast({ type: 'success', message: 'Postulación enviada correctamente' });
        setTimeout(() => {
          router.push(`/project/${projectId}`);
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al enviar la postulación');
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Error al enviar la postulación' });
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
                const labels = { 'CV': 'CV', 'QUESTIONS': 'Preguntas', 'EVALUATION': 'Evaluación Técnica' };
                return labels[type] || type;
              }).join(', ')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subida de CV */}
            {applicationTypes.includes('CV') && (
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
                  required={applicationTypes.includes('CV')}
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
                    <a href={role.evaluation.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {role.evaluation.link}
                    </a>
                  </p>
                )}
                {role.evaluation.fileUrl && (
                  <p className="text-blue-700 text-sm mb-2">
                    <span className="font-medium">Archivo:</span> {role.evaluation.fileName || 'Ver archivo'}
                  </p>
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
            {project.requiresPartner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción como socio
                </label>
                <InputField
                  multiline
                  rows={3}
                  placeholder="Describe qué puedes aportar como socio..."
                  value={applicationData.partnerDescription}
                  onChange={(e) => setApplicationData(prev => ({...prev, partnerDescription: e.target.value}))}
                />
              </div>
            )}

            {project.requiresInvestor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de inversión
                  </label>
                  <InputField
                    multiline
                    rows={3}
                    placeholder="Describe tu propuesta de inversión..."
                    value={applicationData.investorMessage}
                    onChange={(e) => setApplicationData(prev => ({...prev, investorMessage: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de inversión
                  </label>
                  <InputField
                    type="number"
                    placeholder="Monto en pesos"
                    value={applicationData.investorAmount}
                    onChange={(e) => setApplicationData(prev => ({...prev, investorAmount: e.target.value}))}
                  />
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