'use client';

import { useState, useEffect } from 'react';
import { X, Briefcase, ChevronRight, AlertCircle } from 'lucide-react';
import { APPLICATION_TYPES, APPLICATION_TYPE_LABELS } from '@/components/project/roles/ProjectRolesManager';
import ApplicationForm from './ApplicationForm';
import TechnicalEvaluationModal from './TechnicalEvaluationModal';

/**
 * Modal para seleccionar rol y completar postulación
 */
export default function RoleApplicationModal({ 
  isOpen, 
  onClose, 
  projectTitle,
  projectId,
  roles = [],
  loading,
  error,
  onSubmit,
  onSubmitEvaluation // Nueva prop para enviar evaluación técnica
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'apply' | 'evaluation'
  const [viewedRoles, setViewedRoles] = useState(new Set());
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  // Cargar roles ya vistos desde localStorage al montar
  useEffect(() => {
    if (projectId) {
      const storageKey = `project_${projectId}_viewed_roles`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setViewedRoles(new Set(parsed));
        } catch (e) {
          console.error('Error parsing viewed roles:', e);
        }
      }
    }
  }, [projectId]);

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('apply');
    
    // Marcar este rol como visto cuando el usuario entra al formulario
    if (projectId && role.id) {
      setViewedRoles((prevViewedRoles) => {
        const updatedViewedRoles = new Set(prevViewedRoles);
        updatedViewedRoles.add(role.id);
        // Guardar en localStorage con el valor actualizado
        const storageKey = `project_${projectId}_viewed_roles`;
        localStorage.setItem(storageKey, JSON.stringify([...updatedViewedRoles]));
        return updatedViewedRoles;
      });
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedRole(null);
  };

  const handleSubmitApplication = async (applicationData) => {
    const result = await onSubmit({
      roleId: selectedRole.id,
      ...applicationData
    });

    // Si la postulación fue exitosa y el rol tiene evaluación técnica, mostrar el modal
    if (result && result.success) {
      const hasEvaluation = [
        APPLICATION_TYPES.TECHNICAL_EVALUATION,
        APPLICATION_TYPES.MIXED
      ].includes(selectedRole.applicationType) && selectedRole.evaluation;

      if (hasEvaluation) {
        setShowEvaluationModal(true);
      } else {
        // Si no hay evaluación, cerrar el modal principal
        handleClose();
      }
    }
  };

  const handleSubmitEvaluation = async (evaluationFile) => {
    if (!onSubmitEvaluation) {
      console.error('onSubmitEvaluation callback not provided');
      return;
    }

    setEvaluationLoading(true);
    try {
      await onSubmitEvaluation({
        roleId: selectedRole.id,
        evaluationFile
      });
      // Cerrar ambos modales después de enviar la evaluación
      setShowEvaluationModal(false);
      handleClose();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setEvaluationLoading(false);
    }
  };

  const handleSkipEvaluation = () => {
    // Cerrar modal de evaluación y el modal principal
    setShowEvaluationModal(false);
    handleClose();
  };
  
  const handleClose = () => {
    // Solo resetear el step, no limpiar los roles vistos
    setStep('select');
    setSelectedRole(null);
    onClose();
  };

  const isRoleAlreadyViewed = (roleId) => {
    return viewedRoles.has(roleId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {step === 'select' ? 'Seleccionar Rol' : 'Completar Postulación'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Proyecto: <span className="font-semibold text-conexia-green">"{projectTitle}"</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'select' && (
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Este proyecto tiene varios roles disponibles. Selecciona el que mejor se ajuste a tu perfil:
              </p>

              {roles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="mx-auto mb-3 text-gray-400" size={48} />
                  <p>No hay roles disponibles en este momento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map((role, index) => {
                    const alreadyViewed = isRoleAlreadyViewed(role.id);
                    
                    return (
                      <div key={index} className="relative">
                        <button
                          onClick={() => !alreadyViewed && handleRoleSelect(role)}
                          disabled={alreadyViewed}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                            alreadyViewed
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : 'border-gray-200 hover:border-conexia-green hover:bg-green-50 group'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className={`font-semibold ${
                                  alreadyViewed 
                                    ? 'text-gray-500' 
                                    : 'text-gray-900 group-hover:text-conexia-green transition-colors'
                                }`}>
                                  {role.title}
                                </h3>
                                {role.vacancies && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    alreadyViewed
                                      ? 'bg-gray-100 text-gray-500'
                                      : 'bg-conexia-green/10 text-conexia-green'
                                  }`}>
                                    {role.vacancies} {role.vacancies === 1 ? 'vacante' : 'vacantes'}
                                  </span>
                                )}
                                {alreadyViewed && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
                                    Ya iniciaste postulación
                                  </span>
                                )}
                              </div>
                              {role.description && (
                                <p className={`text-sm mb-2 line-clamp-2 ${
                                  alreadyViewed ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {role.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {(role.applicationTypes || [role.applicationType]).map((type, idx) => (
                                  <span key={idx} className={`px-2 py-1 rounded ${
                                    alreadyViewed ? 'bg-gray-100 text-gray-400' : 'bg-gray-100'
                                  }`}>
                                    {APPLICATION_TYPE_LABELS[type]}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {!alreadyViewed && (
                              <ChevronRight className="text-gray-400 group-hover:text-conexia-green transition-colors mt-1" size={20} />
                            )}
                          </div>
                        </button>
                        {alreadyViewed && (
                          <div className="mt-2 flex items-start gap-2 px-4">
                            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-amber-700">
                              Ya accediste a las preguntas/evaluación de este rol. No puedes volver a verlas.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'apply' && selectedRole && (
            <ApplicationForm
              role={selectedRole}
              onSubmit={handleSubmitApplication}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>

      {/* Modal de evaluación técnica */}
      {showEvaluationModal && selectedRole && (
        <TechnicalEvaluationModal
          isOpen={showEvaluationModal}
          onClose={() => {
            setShowEvaluationModal(false);
            handleClose();
          }}
          evaluation={selectedRole.evaluation}
          roleTitle={selectedRole.title}
          onSubmit={handleSubmitEvaluation}
          onSkip={handleSkipEvaluation}
          loading={evaluationLoading}
        />
      )}
    </div>
  );
}
