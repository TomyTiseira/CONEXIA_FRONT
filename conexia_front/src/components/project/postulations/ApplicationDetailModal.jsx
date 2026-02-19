'use client';

import { useState } from 'react';
import { X, Download, CheckCircle, XCircle, User, Mail, Calendar, FileText, MessageSquare, DollarSign } from 'lucide-react';
import { APPLICATION_TYPES } from '@/components/project/roles/ProjectRolesManager';
import Button from '@/components/ui/Button';

/**
 * Modal con detalle completo de una aplicación/postulación
 */
export default function ApplicationDetailModal({ 
  application, 
  role,
  onClose, 
  onApprove, 
  onReject,
  loading 
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const handleReject = () => {
    if (!feedback.trim()) {
      setFeedbackError('Por favor, proporciona un motivo para el rechazo');
      return;
    }
    onReject(application.id, feedback);
  };

  const getStatusInfo = () => {
    const statuses = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Pendiente de revisión' },
      approved: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Aprobado' },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Rechazado' },
    };
    return statuses[application.status] || statuses.pending;
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Detalle de postulación
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Rol: <span className="font-semibold text-conexia-green">{role.title}</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Información del candidato */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Información del candidato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{application.applicantName || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{application.applicantEmail || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Fecha de postulación:</span>
                    <span className="font-medium">
                      {new Date(application.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CV */}
              {application.cvFile && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Currículum Vitae
                  </h3>
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600" size={24} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">CV_{application.applicantName}.pdf</p>
                        <p className="text-xs text-gray-500">Documento PDF</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="flex items-center gap-2 text-sm">
                      <Download size={16} />
                      Descargar
                    </Button>
                  </div>
                </div>
              )}

              {/* Respuestas a preguntas */}
              {role.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS || 
               role.applicationType === APPLICATION_TYPES.MIXED && application.answers && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Respuestas a preguntas
                  </h3>
                  <div className="space-y-4">
                    {role.questions?.map((question, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="pl-4 border-l-2 border-conexia-green">
                          <p className="text-sm text-gray-700">
                            {application.answers?.[index] || 'Sin respuesta'}
                          </p>
                        </div>
                        {question.type === 'multiple' && question.options && (
                          <div className="mt-2 flex items-center gap-2">
                            {question.options.find(opt => opt.text === application.answers?.[index] && opt.isCorrect) && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                ✓ Respuesta correcta
                              </span>
                            )}
                            {question.options.find(opt => opt.text === application.answers?.[index] && !opt.isCorrect) && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                ✗ Respuesta incorrecta
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluación técnica */}
              {(role.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION || 
                role.applicationType === APPLICATION_TYPES.MIXED) && application.evaluationFile && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Solución de evaluación técnica
                  </h3>
                  
                  {/* Descripción de la evaluación */}
                  {role.evaluation?.description && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Evaluación solicitada:</strong>
                      </p>
                      <p className="text-sm text-gray-600">{role.evaluation.description}</p>
                    </div>
                  )}

                  {/* Archivo de solución */}
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="text-purple-600" size={24} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Solución_Evaluación.{application.evaluationFile?.extension || 'file'}</p>
                        <p className="text-xs text-gray-500">Enviado por el candidato</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="flex items-center gap-2 text-sm">
                      <Download size={16} />
                      Descargar
                    </Button>
                  </div>
                </div>
              )}

              {/* Información de inversor */}
              {role.applicationType === APPLICATION_TYPES.INVESTOR && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign size={18} />
                    Propuesta de inversión
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Monto a invertir:</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${application.investmentAmount?.toLocaleString('es-ES') || '0'} USD
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Descripción de la propuesta:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {application.investmentDescription || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de socio */}
              {role.applicationType === APPLICATION_TYPES.PARTNER && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} />
                    Propuesta como socio/cofundador
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Cómo puede ayudar al proyecto:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {application.partnerContribution || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback de rechazo (si existe) */}
              {application.status === 'rejected' && application.feedback && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Motivo de rechazo</h3>
                  <p className="text-sm text-red-700">{application.feedback}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer con acciones */}
          {application.status === 'pending' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="secondary"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Rechazar
                </Button>
                <Button
                  onClick={() => onApprove(application.id)}
                  variant="primary"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={18} />
                  {loading ? 'Aprobando...' : 'Aprobar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rechazar Postulación</h3>
              <p className="text-sm text-gray-600 mb-4">
                Por favor, proporciona un motivo para el rechazo. Esta información será enviada al candidato.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setFeedbackError('');
                }}
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                  feedbackError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explica por qué esta postulación no cumple con los requisitos del rol..."
              />
              {feedbackError && <p className="text-xs text-red-600 mt-1">{feedbackError}</p>}
              <p className="text-xs text-gray-500 text-right mt-1">{feedback.length}/500</p>
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setFeedback('');
                    setFeedbackError('');
                  }}
                  variant="secondary"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReject}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
