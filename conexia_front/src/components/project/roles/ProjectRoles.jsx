'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUsers, FiBriefcase } from 'react-icons/fi';
import { APPLICATION_TYPE_LABELS } from './ProjectRolesManager';
import Button from '@/components/ui/Button';

/**
 * Componente para mostrar los roles disponibles de un proyecto
 */
export default function ProjectRoles({ roles = [], onApply, isOwner = false }) {
  const [expandedRoles, setExpandedRoles] = useState({});

  if (!roles || roles.length === 0) {
    return null;
  }

  const toggleExpand = (index) => {
    setExpandedRoles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <FiBriefcase className="w-5 h-5 text-conexia-green" />
        <h3 className="text-xl font-bold text-gray-900">
          Roles disponibles
        </h3>
        <span className="text-sm text-gray-600">
          ({roles.length} {roles.length === 1 ? 'rol' : 'roles'})
        </span>
      </div>

      <div className="space-y-3">
        {roles.map((role, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header del rol */}
            <div 
              className="p-4 bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{role.title}</h4>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-conexia-green/10 text-conexia-green">
                    <FiUsers className="w-3 h-3 inline mr-1" />
                    {role.vacancies} {role.vacancies === 1 ? 'vacante' : 'vacantes'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Postulación: {APPLICATION_TYPE_LABELS[role.applicationType]}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!isOwner && onApply && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApply(role, index);
                    }}
                    className="px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors text-sm font-semibold"
                  >
                    Postularme
                  </button>
                )}
                {expandedRoles[index] ? (
                  <FiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Detalles expandidos */}
            {expandedRoles[index] && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Descripción del rol
                    </label>
                    <p className="text-sm text-gray-800 mt-1.5 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Detalles según tipo de postulación */}
                  {role.questions && role.questions.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Preguntas a responder ({role.questions.length})
                      </label>
                      <ul className="mt-1.5 space-y-2">
                        {role.questions.map((q, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="font-medium text-conexia-green">{idx + 1}.</span>
                            <span className="flex-1">
                              {q.question}
                              <span className="text-xs text-gray-500 ml-2">
                                ({q.type === 'open' ? 'Respuesta abierta' : 'Opción múltiple'})
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role.evaluation && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Evaluación técnica requerida
                      </label>
                      <div className="mt-1.5 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-800">{role.evaluation.description}</p>
                        {role.evaluation.link && (
                          <a 
                            href={role.evaluation.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                          >
                            🔗 Ver evaluación externa
                          </a>
                        )}
                        {role.evaluation.file && (
                          <p className="text-sm text-gray-700 mt-2">
                            📎 Archivo de evaluación adjunto
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
