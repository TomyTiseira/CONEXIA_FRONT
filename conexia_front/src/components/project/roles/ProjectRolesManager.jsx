'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import RoleFormModal from './RoleFormModal';

/**
 * Tipos de postulación disponibles
 */
export const APPLICATION_TYPES = {
  CV_ONLY: 'cv_only',
  CUSTOM_QUESTIONS: 'custom_questions',
  TECHNICAL_EVALUATION: 'technical_evaluation',
  MIXED: 'mixed',
  INVESTOR: 'investor',
  PARTNER: 'partner',
};

export const APPLICATION_TYPE_LABELS = {
  [APPLICATION_TYPES.CV_ONLY]: 'Solo CV',
  [APPLICATION_TYPES.CUSTOM_QUESTIONS]: 'Preguntas personalizadas',
  [APPLICATION_TYPES.TECHNICAL_EVALUATION]: 'Evaluación técnica',
  [APPLICATION_TYPES.MIXED]: 'Mixto (CV + Preguntas/Evaluación)',
  [APPLICATION_TYPES.INVESTOR]: 'Inversor / Financiamiento',
  [APPLICATION_TYPES.PARTNER]: 'Socio / Cofundador',
};

/**
 * Componente individual de rol con expansión/colapso
 */
function RoleCard({ role, index, onEdit, onDelete, onToggle, isExpanded }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header del rol */}
      <div className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => onToggle(index)}>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900">{role.title}</h4>
            <span className="px-2 py-1 text-xs rounded-full bg-conexia-green/10 text-conexia-green">
              {role.vacancies} {role.vacancies === 1 ? 'vacante' : 'vacantes'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {APPLICATION_TYPE_LABELS[role.applicationType]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar rol"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar rol"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <FiChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Detalles expandidos */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Descripción</label>
              <p className="text-sm text-gray-900 mt-1">{role.description}</p>
            </div>

            {/* Mostrar detalles según tipo de postulación */}
            {role.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS && role.questions?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-600">Preguntas ({role.questions.length})</label>
                <ul className="mt-1 space-y-1">
                  {role.questions.map((q, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {idx + 1}. {q.question} <span className="text-xs text-gray-500">({q.type === 'open' ? 'Abierta' : 'Opción múltiple'})</span>
                      {/* Mostrar opciones si es de opción múltiple */}
                      {q.type === 'multiple' && q.options?.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {q.options.map((opt, optIdx) => (
                            <li key={optIdx} className="text-xs text-gray-600">
                              {opt.isCorrect ? '✓' : '○'} {opt.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {role.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION && role.evaluation && (
              <div>
                <label className="text-xs font-medium text-gray-600">Evaluación técnica</label>
                <p className="text-sm text-gray-700 mt-1">{role.evaluation.description}</p>
                {role.evaluation.file && (
                  <p className="text-xs text-blue-600 mt-1">📎 Archivo adjunto</p>
                )}
                {role.evaluation.link && (
                  <a href={role.evaluation.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                    🔗 {role.evaluation.link}
                  </a>
                )}
              </div>
            )}

            {role.applicationType === APPLICATION_TYPES.MIXED && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Configuración mixta</label>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">CV incluido</span>
                    {role.questions?.length > 0 && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{role.questions.length} preguntas</span>
                    )}
                    {role.evaluation && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Evaluación técnica</span>
                    )}
                  </div>
                </div>

                {/* Mostrar preguntas si existen */}
                {role.questions?.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Preguntas ({role.questions.length})</label>
                    <ul className="mt-1 space-y-1">
                      {role.questions.map((q, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {idx + 1}. {q.question} <span className="text-xs text-gray-500">({q.type === 'open' ? 'Abierta' : 'Opción múltiple'})</span>
                          {/* Mostrar opciones si es de opción múltiple */}
                          {q.type === 'multiple' && q.options?.length > 0 && (
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {q.options.map((opt, optIdx) => (
                                <li key={optIdx} className="text-xs text-gray-600">
                                  {opt.isCorrect ? '✓' : '○'} {opt.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mostrar evaluación técnica si existe */}
                {role.evaluation && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Evaluación técnica</label>
                    <p className="text-sm text-gray-700 mt-1">{role.evaluation.description}</p>
                    {role.evaluation.file && (
                      <p className="text-xs text-blue-600 mt-1">📎 Archivo adjunto</p>
                    )}
                    {role.evaluation.link && (
                      <a href={role.evaluation.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                        🔗 {role.evaluation.link}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente principal de gestión de roles
 */
export default function ProjectRolesManager({ roles = [], onChange, error }) {
  const [expandedRoles, setExpandedRoles] = useState({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleToggleExpand = (index) => {
    setExpandedRoles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAddRole = () => {
    setEditingIndex(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (index) => {
    setEditingIndex(index);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (index) => {
    if (confirm('¿Estás seguro de eliminar este rol?')) {
      const updatedRoles = roles.filter((_, i) => i !== index);
      onChange(updatedRoles);
    }
  };

  const handleSaveRole = (roleData) => {
    if (editingIndex !== null) {
      // Editar rol existente
      const updatedRoles = [...roles];
      updatedRoles[editingIndex] = roleData;
      onChange(updatedRoles);
    } else {
      // Agregar nuevo rol
      onChange([...roles, roleData]);
    }
    setShowRoleModal(false);
    setEditingIndex(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-semibold text-conexia-green-dark">
            Roles del proyecto <span className="text-red-600">*</span>
          </label>
          <p className="text-xs text-gray-600 mt-1">
            Define los roles que necesitas para tu proyecto y el tipo de postulación para cada uno
          </p>
        </div>
        <Button
          type="button"
          variant="neutral"
          onClick={handleAddRole}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Agregar rol
        </Button>
      </div>

      {/* Lista de roles */}
      {roles.length > 0 ? (
        <div className="space-y-3 mb-4">
          {roles.map((role, index) => (
            <RoleCard
              key={index}
              role={role}
              index={index}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
              onToggle={handleToggleExpand}
              isExpanded={expandedRoles[index]}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <p className="text-gray-500">No hay roles definidos aún</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* Modal de rol */}
      {showRoleModal && (
        <RoleFormModal
          role={editingIndex !== null ? roles[editingIndex] : null}
          onSave={handleSaveRole}
          onCancel={() => {
            setShowRoleModal(false);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}
