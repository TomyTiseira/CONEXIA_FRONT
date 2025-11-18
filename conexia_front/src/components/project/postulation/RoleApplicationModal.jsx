'use client';

import { useState } from 'react';
import { X, Briefcase, ChevronRight } from 'lucide-react';
import { APPLICATION_TYPES, APPLICATION_TYPE_LABELS } from '@/components/project/roles/ProjectRolesManager';
import ApplicationForm from './ApplicationForm';

/**
 * Modal para seleccionar rol y completar postulación
 */
export default function RoleApplicationModal({ 
  isOpen, 
  onClose, 
  projectTitle,
  roles = [],
  loading,
  error,
  onSubmit
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'apply'

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('apply');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedRole(null);
  };

  const handleSubmitApplication = (applicationData) => {
    onSubmit({
      roleId: selectedRole.id,
      ...applicationData
    });
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
            onClick={onClose}
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
                  {roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-conexia-green hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-conexia-green transition-colors">
                              {role.title}
                            </h3>
                            {role.vacancies && (
                              <span className="px-2 py-1 text-xs rounded-full bg-conexia-green/10 text-conexia-green">
                                {role.vacancies} {role.vacancies === 1 ? 'vacante' : 'vacantes'}
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {role.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {(role.applicationTypes || [role.applicationType]).map((type, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                                {APPLICATION_TYPE_LABELS[type]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-conexia-green transition-colors mt-1" size={20} />
                      </div>
                    </button>
                  ))}
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
    </div>
  );
}
