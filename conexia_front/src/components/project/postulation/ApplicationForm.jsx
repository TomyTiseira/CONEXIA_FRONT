'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ChevronLeft, DollarSign } from 'lucide-react';
import { APPLICATION_TYPES } from '@/components/project/roles/ProjectRolesManager';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';

/**
 * Formulario dinámico de postulación según tipo de rol
 */
export default function ApplicationForm({ role, onSubmit, onBack, loading, error }) {
  const [formData, setFormData] = useState({
    cvFile: null,
    answers: {}, // Para preguntas: { questionIndex: answer }
    evaluationFile: null,
    investmentAmount: '', // Para inversores
    investmentDescription: '', // Para inversores
    partnerContribution: '', // Para socios
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const cvFileInputRef = useRef(null);
  const evaluationFileInputRef = useRef(null);

  const requiresCV = [
    APPLICATION_TYPES.CV_ONLY,
    APPLICATION_TYPES.MIXED,
    APPLICATION_TYPES.INVESTOR,
    APPLICATION_TYPES.PARTNER,
  ].includes(role.applicationType);

  const requiresQuestions = [
    APPLICATION_TYPES.CUSTOM_QUESTIONS,
    APPLICATION_TYPES.MIXED,
  ].includes(role.applicationType);

  const requiresEvaluation = [
    APPLICATION_TYPES.TECHNICAL_EVALUATION,
    APPLICATION_TYPES.MIXED,
  ].includes(role.applicationType);

  const isInvestor = role.applicationType === APPLICATION_TYPES.INVESTOR;
  const isPartner = role.applicationType === APPLICATION_TYPES.PARTNER;

  // Manejo de archivos
  const handleFileSelect = (file, type) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [type]: 'El archivo no puede superar los 10MB' }));
      return;
    }

    if (type === 'cvFile' && file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, cvFile: 'Solo se permiten archivos PDF para el CV' }));
      return;
    }

    setFormData(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: null }));
  };

  // Manejo de respuestas a preguntas
  const handleAnswerChange = (questionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value
      }
    }));
    setTouched(prev => ({ ...prev, [`question_${questionIndex}`]: true }));
  };

  // Validación
  const validate = () => {
    const newErrors = {};

    if (requiresCV && !formData.cvFile) {
      newErrors.cvFile = 'El CV es requerido';
    }

    if (requiresQuestions && role.questions) {
      role.questions.forEach((question, index) => {
        if (!formData.answers[index] || formData.answers[index].trim() === '') {
          newErrors[`question_${index}`] = 'Esta pregunta es requerida';
        }
      });
    }

    if (requiresEvaluation && !formData.evaluationFile) {
      newErrors.evaluationFile = 'Debes adjuntar tu solución a la evaluación técnica';
    }

    if (isInvestor) {
      if (!formData.investmentAmount || formData.investmentAmount <= 0) {
        newErrors.investmentAmount = 'El monto de inversión es requerido';
      }
      if (!formData.investmentDescription || formData.investmentDescription.trim() === '') {
        newErrors.investmentDescription = 'La descripción es requerida';
      }
    }

    if (isPartner && (!formData.partnerContribution || formData.partnerContribution.trim() === '')) {
      newErrors.partnerContribution = 'Debes describir cómo podrías ayudar al proyecto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos como touched
    const allTouched = { cvFile: true, evaluationFile: true };
    if (requiresQuestions && role.questions) {
      role.questions.forEach((_, index) => {
        allTouched[`question_${index}`] = true;
      });
    }
    setTouched(allTouched);

    if (validate()) {
      onSubmit(formData);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        {/* Información del rol */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-conexia-green mb-1">{role.title}</h3>
          <p className="text-sm text-gray-700">{role.description}</p>
        </div>

        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* CV Upload */}
        {requiresCV && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currículum Vitae (PDF) <span className="text-red-600">*</span>
            </label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center border-gray-300 hover:border-gray-400 transition-colors">
              {formData.cvFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">{formData.cvFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(formData.cvFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cvFile: null }))}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <button
                    type="button"
                    onClick={() => cvFileInputRef.current?.click()}
                    className="text-conexia-green font-semibold hover:underline text-sm"
                  >
                    Seleccionar archivo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">PDF hasta 10MB</p>
                </div>
              )}
              <input
                ref={cvFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0], 'cvFile')}
                className="hidden"
              />
            </div>
            {errors.cvFile && <p className="text-xs text-red-600 mt-1">{errors.cvFile}</p>}
          </div>
        )}

        {/* Preguntas Personalizadas */}
        {requiresQuestions && role.questions && role.questions.length > 0 && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Preguntas</h4>
              {role.questions.map((question, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {index + 1}. {question.question} <span className="text-red-600">*</span>
                    {question.type === 'multiple' && (
                      <span className="text-xs text-gray-500 ml-2">(Opción múltiple)</span>
                    )}
                  </label>
                  
                  {question.type === 'open' ? (
                    <textarea
                      value={formData.answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                        errors[`question_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Escribe tu respuesta aquí..."
                    />
                  ) : (
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.answers[index] === option.text
                              ? 'border-conexia-green bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${index}`}
                            value={option.text}
                            checked={formData.answers[index] === option.text}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="mr-3"
                          />
                          <span className="text-sm text-gray-700">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {errors[`question_${index}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`question_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluación Técnica */}
        {requiresEvaluation && role.evaluation && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Evaluación Técnica</h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3">{role.evaluation.description}</p>
              {role.evaluation.link && (
                <a
                  href={role.evaluation.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  🔗 Abrir enlace de la evaluación
                </a>
              )}
              {role.evaluation.file && (
                <p className="text-sm text-gray-600 mt-2">
                  📎 El proyecto incluye un archivo adjunto con la evaluación
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adjunta tu solución <span className="text-red-600">*</span>
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center border-gray-300 hover:border-gray-400 transition-colors">
                {formData.evaluationFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={24} />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{formData.evaluationFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.evaluationFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, evaluationFile: null }))}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <button
                      type="button"
                      onClick={() => evaluationFileInputRef.current?.click()}
                      className="text-conexia-green font-semibold hover:underline text-sm"
                    >
                      Seleccionar archivo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Cualquier formato hasta 10MB</p>
                  </div>
                )}
                <input
                  ref={evaluationFileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files[0], 'evaluationFile')}
                  className="hidden"
                />
              </div>
              {errors.evaluationFile && <p className="text-xs text-red-600 mt-1">{errors.evaluationFile}</p>}
            </div>
          </div>
        )}

        {/* Campos para Inversor */}
        {isInvestor && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Detalles de Inversión</h4>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monto a invertir (USD) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.investmentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, investmentAmount: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                    errors.investmentAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10000"
                />
              </div>
              {errors.investmentAmount && <p className="text-xs text-red-600 mt-1">{errors.investmentAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe tu propuesta de inversión <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.investmentDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentDescription: e.target.value }))}
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                  errors.investmentDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explica qué esperas a cambio de tu inversión, en qué condiciones, y cómo puedes aportar valor adicional al proyecto..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.investmentDescription && <p className="text-xs text-red-600">{errors.investmentDescription}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.investmentDescription.length}/500</p>
              </div>
            </div>
          </div>
        )}

        {/* Campos para Socio */}
        {isPartner && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Tu Propuesta como Socio</h4>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Cómo podrías ayudar al proyecto? <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.partnerContribution}
                onChange={(e) => setFormData(prev => ({ ...prev, partnerContribution: e.target.value }))}
                rows={5}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                  errors.partnerContribution ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe tus habilidades, experiencia, red de contactos, recursos que puedes aportar, visión para el proyecto, disponibilidad, etc..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.partnerContribution && <p className="text-xs text-red-600">{errors.partnerContribution}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.partnerContribution.length}/500</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <Button
          type="button"
          onClick={onBack}
          variant="secondary"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Volver
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Enviando...' : 'Enviar Postulación'}
        </Button>
      </div>
    </form>
  );
}
