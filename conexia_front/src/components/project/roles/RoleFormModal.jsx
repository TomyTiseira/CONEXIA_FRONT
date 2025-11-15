'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiUpload, FiLink, FiEdit2 } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import { APPLICATION_TYPES, APPLICATION_TYPE_LABELS } from './ProjectRolesManager';

/**
 * Modal para crear o editar un rol del proyecto
 */
export default function RoleFormModal({ role, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vacancies: 1,
    applicationType: APPLICATION_TYPES.CV_ONLY,
    questions: [],
    evaluation: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (role) {
      setFormData(role);
    }
  }, [role]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'title':
        if (!value || value.trim() === '') {
          error = 'El título del rol es requerido';
        } else if (value.length < 3) {
          error = 'El título debe tener al menos 3 caracteres';
        }
        break;
      case 'description':
        if (!value || value.trim() === '') {
          error = 'La descripción es requerida';
        } else if (value.length < 10) {
          error = 'La descripción debe tener al menos 10 caracteres';
        }
        break;
      case 'vacancies':
        if (!value || value < 1) {
          error = 'Debe haber al menos 1 vacante';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateAll = () => {
    const fields = ['title', 'description', 'vacancies'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Validaciones específicas por tipo de postulación
    if (formData.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS && formData.questions.length === 0) {
      setErrors(prev => ({ ...prev, questions: 'Debe agregar al menos una pregunta' }));
      isValid = false;
    }

    if (formData.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION && !formData.evaluation) {
      setErrors(prev => ({ ...prev, evaluation: 'Debe configurar la evaluación técnica' }));
      isValid = false;
    }

    if (formData.applicationType === APPLICATION_TYPES.MIXED && 
        formData.questions.length === 0 && !formData.evaluation) {
      setErrors(prev => ({ ...prev, mixed: 'Debe agregar preguntas o evaluación técnica' }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = () => {
    setTouched({ title: true, description: true, vacancies: true });
    
    if (validateAll()) {
      onSave(formData);
    }
  };

  // Opciones de tipo de postulación
  const applicationTypeOptions = Object.entries(APPLICATION_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {role ? 'Editar rol' : 'Nuevo rol'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-1">
            {/* Título del rol */}
            <div>
              <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                Título del rol <span className="text-red-600">*</span>
              </label>
              <InputField
                name="title"
                placeholder="ej: Desarrollador Full Stack, Diseñador UX/UI"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                error={touched.title && errors.title}
              />
            </div>

            {/* Descripción del rol */}
            <div>
              <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                Descripción <span className="text-red-600">*</span>
              </label>
              <InputField
                name="description"
                placeholder="Describe las responsabilidades y requisitos del rol"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                error={touched.description && errors.description}
                showCharCount
                maxLength={500}
              />
            </div>

            {/* Número de vacantes */}
            <div>
              <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                Número de vacantes <span className="text-red-600">*</span>
              </label>
              <InputField
                name="vacancies"
                type="number"
                min="1"
                placeholder="1"
                value={formData.vacancies}
                onChange={(e) => handleChange('vacancies', parseInt(e.target.value) || 1)}
                onBlur={() => handleBlur('vacancies')}
                error={touched.vacancies && errors.vacancies}
              />
            </div>

            {/* Tipo de postulación */}
            <div>
              <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                Tipo de postulación <span className="text-red-600">*</span>
              </label>
              <SelectField
                name="applicationType"
                options={applicationTypeOptions}
                value={formData.applicationType}
                onChange={(e) => {
                  handleChange('applicationType', e.target.value);
                  // Limpiar configuraciones previas al cambiar de tipo
                  setFormData(prev => ({
                    ...prev,
                    applicationType: e.target.value,
                    questions: [],
                    evaluation: null,
                  }));
                  setErrors(prev => ({ ...prev, questions: '', evaluation: '', mixed: '' }));
                }}
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.applicationType === APPLICATION_TYPES.CV_ONLY && 'El candidato solo adjuntará su CV'}
                {formData.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS && 'El candidato responderá preguntas personalizadas'}
                {formData.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION && 'El candidato completará una evaluación técnica'}
                {formData.applicationType === APPLICATION_TYPES.MIXED && 'El candidato adjuntará CV y completará preguntas/evaluación'}
                {formData.applicationType === APPLICATION_TYPES.INVESTOR && 'Para personas que buscan invertir capital'}
                {formData.applicationType === APPLICATION_TYPES.PARTNER && 'Para personas que buscan ser socios/cofundadores'}
              </p>
            </div>

            {/* Sección de preguntas personalizadas */}
            {(formData.applicationType === APPLICATION_TYPES.CUSTOM_QUESTIONS || 
              formData.applicationType === APPLICATION_TYPES.MIXED) && (
              <QuestionBuilder
                questions={formData.questions}
                onChange={(questions) => {
                  handleChange('questions', questions);
                  setErrors(prev => ({ ...prev, questions: '', mixed: '' }));
                }}
                error={errors.questions}
              />
            )}

            {/* Sección de evaluación técnica */}
            {(formData.applicationType === APPLICATION_TYPES.TECHNICAL_EVALUATION || 
              formData.applicationType === APPLICATION_TYPES.MIXED) && (
              <EvaluationBuilder
                evaluation={formData.evaluation}
                onChange={(evaluation) => {
                  handleChange('evaluation', evaluation);
                  setErrors(prev => ({ ...prev, evaluation: '', mixed: '' }));
                }}
                error={errors.evaluation}
              />
            )}

            {/* Error para modo mixto */}
            {formData.applicationType === APPLICATION_TYPES.MIXED && errors.mixed && (
              <p className="text-sm text-red-600">{errors.mixed}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
            <Button type="button" variant="cancel" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" variant="neutral" onClick={handleSubmit}>
              {role ? 'Guardar cambios' : 'Agregar rol'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para construir preguntas personalizadas
 */
function QuestionBuilder({ questions, onChange, error }) {
  const [newQuestion, setNewQuestion] = useState({ question: '', type: 'open', options: [] });
  const [newOption, setNewOption] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddQuestion = () => {
    if (newQuestion.question.trim()) {
      // Validar que si es opción múltiple tenga al menos 2 opciones y al menos una correcta
      if (newQuestion.type === 'multiple') {
        if (newQuestion.options.length < 2) {
          return; // No agregar si no hay suficientes opciones
        }
        if (!newQuestion.options.some(opt => opt.isCorrect)) {
          return; // No agregar si no hay al menos una opción correcta
        }
      }

      if (editingIndex !== null) {
        // Actualizar pregunta existente
        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = { ...newQuestion };
        onChange(updatedQuestions);
        setEditingIndex(null);
      } else {
        // Agregar nueva pregunta
        onChange([...questions, { ...newQuestion }]);
      }
      
      setNewQuestion({ question: '', type: 'open', options: [] });
      setNewOption('');
    }
  };

  const handleRemoveQuestion = (index) => {
    onChange(questions.filter((_, i) => i !== index));
    // Si estábamos editando esta pregunta, cancelar la edición
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion({ question: '', type: 'open', options: [] });
      setNewOption('');
    }
  };

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setNewQuestion({ ...questions[index] });
    setNewOption('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewQuestion({ question: '', type: 'open', options: [] });
    setNewOption('');
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, { text: newOption, isCorrect: false }]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleToggleCorrect = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
      )
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setNewQuestion(prev => ({ 
      ...prev, 
      type: newType,
      options: newType === 'open' ? [] : prev.options 
    }));
  };

  const canAddQuestion = () => {
    if (!newQuestion.question.trim()) return false;
    if (newQuestion.type === 'multiple') {
      return newQuestion.options.length >= 2 && newQuestion.options.some(opt => opt.isCorrect);
    }
    return true;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Preguntas personalizadas
      </label>

      {/* Lista de preguntas */}
      {questions.length > 0 && (
        <div className="space-y-2 mb-4">
          {questions.map((q, index) => (
            <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${editingIndex === index ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Tipo: {q.type === 'open' ? 'Respuesta abierta' : 'Opción múltiple'}
                </p>
                {q.type === 'multiple' && q.options?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 text-xs">
                        <span className={opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {opt.isCorrect ? '✓' : '○'} {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleEditQuestion(index)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Editar pregunta"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar pregunta"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agregar/Editar pregunta */}
      <div className="space-y-2">
        {editingIndex !== null && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700 font-medium">
              ✏️ Editando pregunta
            </span>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Cancelar edición
            </button>
          </div>
        )}
        <InputField
          placeholder="Escribe tu pregunta"
          value={newQuestion.question}
          onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
        />
        <SelectField
          options={[
            { value: 'open', label: 'Respuesta abierta' },
            { value: 'multiple', label: 'Opción múltiple' },
          ]}
          value={newQuestion.type}
          onChange={handleTypeChange}
        />

        {/* Opciones para preguntas de opción múltiple */}
        {newQuestion.type === 'multiple' && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Opciones de respuesta
            </label>

            {/* Lista de opciones */}
            {newQuestion.options.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {newQuestion.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(index)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        opt.isCorrect 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      title={opt.isCorrect ? 'Respuesta correcta' : 'Marcar como correcta'}
                    >
                      {opt.isCorrect && '✓'}
                    </button>
                    <span className="flex-1 text-sm text-gray-900">{opt.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nueva opción */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <InputField
                  placeholder="Escribe una opción"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                disabled={!newOption.trim()}
                className="w-10 h-10 bg-[#367d7d] text-white rounded-lg hover:bg-[#2b6a6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {newQuestion.options.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                {newQuestion.options.length < 2 && '⚠️ Agrega al menos 2 opciones'}
                {newQuestion.options.length >= 2 && !newQuestion.options.some(opt => opt.isCorrect) && '⚠️ Marca al menos una respuesta correcta'}
                {newQuestion.options.length >= 2 && newQuestion.options.some(opt => opt.isCorrect) && '✓ Pregunta lista para agregar'}
              </p>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="neutral"
          onClick={handleAddQuestion}
          disabled={!canAddQuestion()}
          className="w-full flex items-center justify-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          {editingIndex !== null ? 'Guardar cambios' : 'Agregar pregunta'}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

/**
 * Componente para configurar evaluación técnica
 */
function EvaluationBuilder({ evaluation, onChange, error }) {
  const [formData, setFormData] = useState(evaluation || {
    description: '',
    link: '',
    file: null,
  });

  useEffect(() => {
    if (formData.description || formData.link || formData.file) {
      onChange(formData);
    }
  }, [formData]);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Evaluación técnica
      </label>

      <div className="space-y-0">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Descripción de la evaluación
          </label>
          <InputField
            placeholder="Describe qué debe hacer el candidato"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="-mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Link externo (opcional)
          </label>
          <InputField
            placeholder="https://..."
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Archivo adjunto (opcional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData(prev => ({ ...prev, file }));
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-conexia-green file:text-white hover:file:bg-[#1a7a66]"
            />
          </div>
          {formData.file && (
            <p className="text-xs text-gray-600 mt-1">
              Archivo: {formData.file.name}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
