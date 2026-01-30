'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { submitTechnicalEvaluation, getMyPostulations } from '@/service/postulations/postulationService';
import Navbar from '@/components/navbar/Navbar';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import Toast from '@/components/ui/Toast';
import { FileText, Link as LinkIcon, Upload, AlertCircle } from 'lucide-react';

export default function TechnicalEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [postulation, setPostulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [evaluationData, setEvaluationData] = useState({
    evaluationDescription: '',
    evaluationLink: '',
    evaluation: null
  });

  const projectId = params.id;
  const postulationId = params.postulationId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        // Cargar proyecto
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);

        // Buscar la postulación específica
        let foundPostulation = null;
        let page = 1;
        const maxPages = 10;

        while (!foundPostulation && page <= maxPages) {
          const response = await getMyPostulations(page);
          
          if (!response.success || !response.data.postulations.length) {
            break;
          }

          foundPostulation = response.data.postulations.find(
            p => String(p.id) === String(postulationId)
          );

          if (!response.data.pagination.hasNextPage) {
            break;
          }

          page++;
        }

        if (!foundPostulation) {
          setToast({ type: 'error', message: 'Postulación no encontrada' });
          return;
        }

        // Verificar que la postulación es del proyecto correcto
        if (String(foundPostulation.projectId) !== String(projectId)) {
          setToast({ type: 'error', message: 'La postulación no corresponde a este proyecto' });
          return;
        }

        setPostulation(foundPostulation);
      } catch (error) {
        console.error('Error loading data:', error);
        setToast({ type: 'error', message: 'Error al cargar los datos' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, postulationId, isAuthenticated, router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setToast({ type: 'error', message: 'Solo se permiten archivos PDF, PNG o JPG' });
        return;
      }

      // Validar tamaño (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setToast({ type: 'error', message: 'El archivo no puede superar los 10MB' });
        return;
      }

      setEvaluationData(prev => ({ ...prev, evaluation: file }));
    }
  };

  const validateEvaluation = () => {
    const { evaluationDescription, evaluationLink, evaluation } = evaluationData;
    const errors = {};

    // Al menos uno de los campos debe estar presente
    if (!evaluationDescription?.trim() && !evaluationLink?.trim() && !evaluation) {
      errors.general = 'Debes proporcionar al menos una descripción, enlace o archivo';
      setFieldErrors(errors);
      return false;
    }

    // Validar URL si se proporciona
    if (evaluationLink?.trim()) {
      try {
        new URL(evaluationLink);
      } catch {
        errors.evaluationLink = 'El enlace proporcionado no es válido';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEvaluation()) return;

    setSubmitting(true);
    try {
      const data = {
        projectId: parseInt(projectId),
        roleId: postulation.roleId
      };

      // Agregar campos opcionales si están presentes
      if (evaluationData.evaluationDescription?.trim()) {
        data.evaluationDescription = evaluationData.evaluationDescription.trim();
      }

      if (evaluationData.evaluationLink?.trim()) {
        data.evaluationLink = evaluationData.evaluationLink.trim();
      }

      if (evaluationData.evaluation) {
        data.evaluation = evaluationData.evaluation;
      }

      const result = await submitTechnicalEvaluation(postulationId, data);

      if (result.success) {
        setToast({ type: 'success', message: 'Evaluación técnica enviada correctamente' });
        setTimeout(() => {
          router.push(`/project/${projectId}`);
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al enviar la evaluación');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setToast({ type: 'error', message: error.message || 'Error al enviar la evaluación técnica' });
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

  if (!project || !postulation) {
    return (
      <div className="min-h-screen bg-[#f3f9f8]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-600">Proyecto o postulación no encontrados</div>
        </div>
      </div>
    );
  }

  const role = project.roles?.find(r => r.id === postulation.roleId);

  return (
    <div className="min-h-screen bg-[#f3f9f8]">
      <Navbar />
      <div className="py-8 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-conexia-green mb-2">
              Evaluación Técnica
            </h1>
            <p className="text-gray-600">
              Proyecto: <span className="font-medium">{project.title}</span>
            </p>
            {role && (
              <p className="text-gray-600">
                Rol: <span className="font-medium">{role.title}</span>
              </p>
            )}
          </div>

          {/* Información de la evaluación */}
          {role?.evaluation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Instrucciones de la evaluación
              </h3>
              <p className="text-blue-800 mb-3">{role.evaluation.description}</p>
              
              {role.evaluation.link && (
                <div className="mb-2">
                  <span className="text-blue-700 font-medium text-sm">Enlace de referencia:</span>
                  <a 
                    href={role.evaluation.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline ml-2 text-sm"
                  >
                    {role.evaluation.link}
                  </a>
                </div>
              )}
              
              {role.evaluation.fileUrl && (
                <div className="mb-2">
                  <span className="text-blue-700 font-medium text-sm">Archivo:</span>
                  <span className="text-blue-600 ml-2 text-sm">
                    {role.evaluation.fileName || 'Ver archivo adjunto'}
                  </span>
                </div>
              )}
              
              {role.evaluation.days && (
                <p className="text-blue-700 text-sm font-medium mt-3">
                  Tiempo límite: {role.evaluation.days} días desde tu postulación
                </p>
              )}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descripción de tu solución
              </label>
              <InputField
                multiline
                rows={6}
                placeholder="Describe cómo resolviste la evaluación, los pasos que seguiste, tecnologías utilizadas, etc."
                value={evaluationData.evaluationDescription}
                onChange={(e) => {
                  setEvaluationData(prev => ({ 
                    ...prev, 
                    evaluationDescription: e.target.value 
                  }));
                  if (fieldErrors.general) {
                    setFieldErrors(prev => ({...prev, general: undefined}));
                  }
                }}
                className={fieldErrors.general ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Proporciona detalles sobre tu implementación y enfoque
              </p>
            </div>

            {/* Enlace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Enlace a tu solución
              </label>
              <InputField
                type="url"
                placeholder="https://github.com/tu-usuario/proyecto"
                value={evaluationData.evaluationLink}
                onChange={(e) => {
                  setEvaluationData(prev => ({ 
                    ...prev, 
                    evaluationLink: e.target.value 
                  }));
                  if (fieldErrors.evaluationLink || fieldErrors.general) {
                    setFieldErrors(prev => ({...prev, evaluationLink: undefined, general: undefined}));
                  }
                }}
                className={fieldErrors.evaluationLink ? 'border-red-500' : ''}
              />
              {fieldErrors.evaluationLink && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.evaluationLink}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Puede ser un repositorio de GitHub, CodePen, enlace a demo, etc.
              </p>
            </div>

            {/* Archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Archivo de la solución
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  handleFileChange(e);
                  if (fieldErrors.general) {
                    setFieldErrors(prev => ({...prev, general: undefined}));
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0 file:text-sm file:font-semibold
                          file:bg-conexia-green file:text-white hover:file:bg-conexia-green/90
                          cursor-pointer"
              />
              {evaluationData.evaluation && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  ✓ {evaluationData.evaluation.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: PDF, PNG, JPG (máx. 10MB)
              </p>
            </div>

            {/* Mostrar error general si no se completó ningún campo */}
            {fieldErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{fieldErrors.general}</p>
              </div>
            )}

            {/* Nota importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Importante:</strong> Debes proporcionar al menos uno de los tres campos anteriores 
                (descripción, enlace o archivo) para enviar tu evaluación.
              </p>
            </div>

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
                {submitting ? 'Enviando...' : 'Enviar Evaluación'}
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
