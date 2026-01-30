'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlus, FiTrash2, FiUpload, FiLink, FiEdit2 } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import RubroSkillsSelector from '@/components/skills/RubroSkillsSelector';
import { useCollaborationTypes } from '@/hooks/project/useCollaborationTypes';
import { useContractTypes } from '@/hooks/project/useContractTypes';
import { useApplicationTypes } from '@/hooks/project/useApplicationTypes';
import { APPLICATION_TYPES, APPLICATION_TYPE_LABELS } from './ProjectRolesManager';

/**
 * Modal para crear o editar un rol del proyecto
 */
export default function RoleFormModal({ role, onSave, onCancel }) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vacancies: '', // Campo opcional - puede estar vacío
    collaborationType: '',
    contractType: '',
    applicationTypes: [], // Cambiado a array para soportar múltiples tipos
    questions: [],
    evaluation: null,
    skills: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Cargar tipos de colaboración, contratación y aplicación
  const { data: collaborationTypes } = useCollaborationTypes();
  const { data: contractTypes } = useContractTypes();
  const { data: applicationTypes } = useApplicationTypes();

  // Verificar que estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSkillsChange = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleApplicationTypeToggle = (type) => {
    setFormData(prev => {
      const currentTypes = prev.applicationTypes || [];
      const isSelected = currentTypes.includes(type);
      
      let newTypes;
      if (isSelected) {
        newTypes = currentTypes.filter(t => t !== type);
      } else {
        newTypes = [...currentTypes, type];
      }
      
      // Limpiar error de applicationTypes si hay al menos uno seleccionado
      if (newTypes.length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, applicationTypes: '' }));
      }
      
      return { ...prev, applicationTypes: newTypes };
    });
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
        // Campo opcional - solo validar si tiene contenido
        if (value && value.trim() !== '' && value.length < 10) {
          error = 'La descripción debe tener al menos 10 caracteres';
        }
        break;
      case 'vacancies':
        // Campo opcional - solo validar si tiene contenido
        if (value && value < 1) {
          error = 'El número de vacantes debe ser al menos 1';
        }
        break;
      case 'collaborationType':
        if (!value) {
          error = 'Debe seleccionar un tipo de colaboración';
        }
        break;
      case 'contractType':
        if (!value) {
          error = 'Debe seleccionar un tipo de contratación';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateAll = () => {
    // Validar campos requeridos: title, collaborationType, contractType
    const fields = ['title', 'collaborationType', 'contractType'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Validar campos opcionales solo si tienen contenido
    if (formData.description && !validateField('description', formData.description)) {
      isValid = false;
    }
    if (formData.vacancies && !validateField('vacancies', formData.vacancies)) {
      isValid = false;
    }

    // Validar que se haya seleccionado al menos un tipo de postulación
    if (!formData.applicationTypes || formData.applicationTypes.length === 0) {
      setErrors(prev => ({ ...prev, applicationTypes: 'Debe seleccionar al menos un tipo de postulación' }));
      isValid = false;
    }

    // Validaciones específicas por tipo de postulación
    if (formData.applicationTypes?.includes(APPLICATION_TYPES.QUESTIONS)) {
      if (formData.questions.length === 0) {
        setErrors(prev => ({ ...prev, questions: 'Debe agregar al menos una pregunta' }));
        isValid = false;
      }
    }

    if (formData.applicationTypes?.includes(APPLICATION_TYPES.EVALUATION)) {
      const evalErrors = [];
      if (!formData.evaluation || !formData.evaluation.description?.trim()) {
        evalErrors.push('descripción');
      }
      if (!formData.evaluation || !formData.evaluation.days || formData.evaluation.days < 1) {
        evalErrors.push('cantidad de días');
      }
      if (evalErrors.length > 0) {
        setErrors(prev => ({ ...prev, evaluation: `Debe completar: ${evalErrors.join(', ')}` }));
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    setTouched({ title: true, collaborationType: true, contractType: true, applicationTypes: true });
    
    if (validateAll()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    onCancel(formData); // Pasar los datos actuales al cerrar
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {role ? 'Editar rol' : 'Nuevo rol'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
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
                Descripción (Opcional)
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

            {/* Fila con 3 campos: Vacantes, Tipo de colaboración, Tipo de contratación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Número de vacantes */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                  Número de vacantes (Opcional)
                </label>
                <InputField
                  name="vacancies"
                  type="number"
                  min="1"
                  placeholder="Sin límite"
                  value={formData.vacancies}
                  onChange={(e) => handleChange('vacancies', parseInt(e.target.value) || '')}
                  onBlur={() => handleBlur('vacancies')}
                  error={touched.vacancies && errors.vacancies}
                />
              </div>

              {/* Tipo de colaboración */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                  Tipo de colaboración <span className="text-red-600">*</span>
                </label>
                <SelectField
                  name="collaborationType"
                  options={collaborationTypes?.map((t) => ({ value: t.id, label: t.name })) || []}
                  value={formData.collaborationType}
                  onChange={(e) => handleChange('collaborationType', e.target.value)}
                  onBlur={() => handleBlur('collaborationType')}
                  error={touched.collaborationType && errors.collaborationType}
                />
              </div>

              {/* Tipo de contratación */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green-dark mb-1">
                  Tipo de contratación <span className="text-red-600">*</span>
                </label>
                <SelectField
                  name="contractType"
                  options={contractTypes?.map((t) => ({ value: t.id, label: t.name })) || []}
                  value={formData.contractType}
                  onChange={(e) => handleChange('contractType', e.target.value)}
                  onBlur={() => handleBlur('contractType')}
                  error={touched.contractType && errors.contractType}
                />
              </div>
            </div>

            {/* Habilidades */}
            <div className="flex flex-col justify-center min-h-[72px] gap-1.5">
              <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
                Habilidades requeridas (Opcional)
              </label>
              <div className="min-h-[110px]">
                <RubroSkillsSelector 
                  selectedSkills={formData.skills} 
                  onSkillsChange={handleSkillsChange} 
                />
              </div>
            </div>

            {/* Tipo de postulación */}
            <div>
              <label className="block text-sm font-semibold text-conexia-green-dark mb-1.5">
                Tipos de postulación <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Selecciona uno o más métodos de postulación para este rol
              </p>
              <div className="relative max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-white">
                {Object.entries(APPLICATION_TYPE_LABELS)
                  .filter(([type]) => type !== APPLICATION_TYPES.PARTNER && type !== APPLICATION_TYPES.INVESTOR && type !== APPLICATION_TYPES.MIXED)
                  .map(([type, label]) => (
                  <label 
                    key={type} 
                    className="flex items-start px-3 py-3 cursor-pointer hover:bg-conexia-green/10 border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      className="accent-conexia-green mr-3 mt-1"
                      checked={formData.applicationTypes?.includes(type) || false}
                      onChange={() => handleApplicationTypeToggle(type)}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {type === APPLICATION_TYPES.CV_ONLY && 'El candidato solo adjuntará su CV'}
                        {type === APPLICATION_TYPES.CUSTOM_QUESTIONS && 'El candidato responderá preguntas personalizadas'}
                        {type === APPLICATION_TYPES.TECHNICAL_EVALUATION && 'El candidato completará una evaluación técnica'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {touched.applicationTypes && errors.applicationTypes && (
                <div className="text-xs text-red-600 mt-1">{errors.applicationTypes}</div>
              )}
              {formData.applicationTypes && formData.applicationTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.applicationTypes.map(type => (
                    <span key={type} className="inline-flex items-center px-3 py-1 bg-conexia-green text-white text-sm rounded-full">
                      {APPLICATION_TYPE_LABELS[type]}
                      <button 
                        type="button" 
                        className="ml-2 text-white hover:text-gray-200 focus:outline-none" 
                        onClick={() => handleApplicationTypeToggle(type)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de preguntas personalizadas */}
            {formData.applicationTypes?.includes(APPLICATION_TYPES.QUESTIONS) && (
              <QuestionBuilder
                questions={formData.questions}
                onChange={(questions) => {
                  handleChange('questions', questions);
                  setErrors(prev => ({ ...prev, questions: '' }));
                }}
                error={errors.questions}
              />
            )}

            {/* Sección de evaluación técnica */}
            {formData.applicationTypes?.includes(APPLICATION_TYPES.EVALUATION) && (
              <EvaluationBuilder
                evaluation={formData.evaluation}
                onChange={(evaluation) => {
                  handleChange('evaluation', evaluation);
                  setErrors(prev => ({ ...prev, evaluation: '' }));
                }}
                error={errors.evaluation}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
            <Button type="button" variant="cancel" onClick={handleClose}>
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

  return createPortal(modalContent, document.body);
}

/**
 * Componente para construir preguntas personalizadas
 */
function QuestionBuilder({ questions, onChange, error }) {
  const [newQuestion, setNewQuestion] = useState({
    questionText: '', 
    questionType: 'OPEN', 
    options: [], 
    hasCorrectAnswers: true // Por defecto, las preguntas tienen respuestas correctas
  });
  const [newOption, setNewOption] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false); // Estado para controlar si se está creando una nueva pregunta

  const handleConfirmQuestion = () => {
    if (newQuestion.questionText.trim()) {
      // Validar que si es opción múltiple tenga al menos 2 opciones
      if (newQuestion.questionType === 'MULTIPLE_CHOICE') {
        if (newQuestion.options.length < 2) {
          return; // No agregar si no hay suficientes opciones
        }
        // Solo validar respuestas correctas si hasCorrectAnswers es true
        if (newQuestion.hasCorrectAnswers && !newQuestion.options.some(opt => opt.isCorrect)) {
          return; // No agregar si debe tener respuestas correctas y no hay ninguna marcada
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
      
      setNewQuestion({ questionText: '', questionType: 'OPEN', options: [], hasCorrectAnswers: true });
      setNewOption('');
      setIsCreatingNew(false); // Ocultar el formulario después de confirmar
    }
  };

  const handleStartNewQuestion = () => {
    setIsCreatingNew(true);
    setEditingIndex(null);
    setNewQuestion({ questionText: '', questionType: 'OPEN', options: [], hasCorrectAnswers: true });
    setNewOption('');
  };

  const handleRemoveQuestion = (index) => {
    onChange(questions.filter((_, i) => i !== index));
    // Si estábamos editando esta pregunta, cancelar la edición
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion({ questionText: '', questionType: 'OPEN', options: [], hasCorrectAnswers: true });
      setNewOption('');
      setIsCreatingNew(false);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setIsCreatingNew(true); // Mostrar el formulario
    setNewQuestion({ ...questions[index] });
    setNewOption('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewQuestion({ questionText: '', questionType: 'OPEN', options: [], hasCorrectAnswers: true });
    setNewOption('');
    setIsCreatingNew(false); // Ocultar el formulario
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
      questionType: newType,
      options: newType === 'OPEN' ? [] : prev.options 
    }));
  };

  const canConfirmQuestion = () => {
    if (!newQuestion.questionText.trim()) return false;
    if (newQuestion.questionType === 'MULTIPLE_CHOICE') {
      // Debe tener al menos 2 opciones
      if (newQuestion.options.length < 2) return false;
      // Solo validar respuesta correcta si hasCorrectAnswers es true
      if (newQuestion.hasCorrectAnswers) {
        return newQuestion.options.some(opt => opt.isCorrect);
      }
      return true;
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
                <p className="text-sm font-medium text-gray-900">{q.questionText}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-600">
                    Tipo: {q.questionType === 'OPEN' ? 'Respuesta abierta' : 'Opción múltiple'}
                  </p>
                  {q.type === 'multiple' && q.hasCorrectAnswers === false && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                      Sin evaluación
                    </span>
                  )}
                </div>
                {q.questionType === 'MULTIPLE_CHOICE' && q.options?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 text-xs">
                        <span className={opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {q.hasCorrectAnswers !== false && opt.isCorrect ? '✓' : '○'} {opt.text}
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
      {isCreatingNew && (
        <div className="space-y-2">
          {editingIndex !== null && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-medium">
                Editando pregunta
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
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
          />
          <div className="w-full overflow-hidden">
            <SelectField
              options={[
                { value: 'OPEN', label: 'Respuesta abierta' },
                { value: 'MULTIPLE_CHOICE', label: 'Opción múltiple' },
              ]}
              value={newQuestion.questionType}
              onChange={handleTypeChange}
              className="w-full"
            />
          </div>

          {/* Opciones para preguntas de opción múltiple */}
          {newQuestion.questionType === 'MULTIPLE_CHOICE' && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              {/* Checkbox para indicar si tiene respuestas correctas */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newQuestion.hasCorrectAnswers}
                    onChange={(e) => setNewQuestion(prev => ({ 
                      ...prev, 
                      hasCorrectAnswers: e.target.checked,
                      // Si se desmarca, limpiar todas las respuestas correctas
                      options: e.target.checked ? prev.options : prev.options.map(opt => ({ ...opt, isCorrect: false }))
                    }))}
                    className="w-4 h-4 text-conexia-green border-gray-300 rounded focus:ring-conexia-green focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-conexia-green transition-colors">
                    Esta pregunta tiene respuesta(s) correcta(s)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {newQuestion.hasCorrectAnswers 
                    ? 'Las respuestas serán evaluadas automáticamente'
                    : 'Las respuestas solo serán revisadas sin evaluación automática'}
                </p>
              </div>

              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Opciones de respuesta
              </label>

              {/* Lista de opciones */}
              {newQuestion.options.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {newQuestion.options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                      {newQuestion.hasCorrectAnswers ? (
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
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-200 bg-gray-100" title="Sin evaluación automática">
                          <span className="text-gray-400 text-xs">-</span>
                        </div>
                      )}
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
                  {newQuestion.options.length < 2 && 'Agrega al menos 2 opciones'}
                  {newQuestion.options.length >= 2 && newQuestion.hasCorrectAnswers && !newQuestion.options.some(opt => opt.isCorrect) && 'Marca al menos una respuesta correcta'}
                  {newQuestion.options.length >= 2 && (!newQuestion.hasCorrectAnswers || newQuestion.options.some(opt => opt.isCorrect)) && 'Pregunta lista para confirmar'}
                </p>
              )}
            </div>
          )}

          {/* Botón para confirmar la pregunta */}
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmQuestion}
            disabled={!canConfirmQuestion()}
            className="w-full flex items-center justify-center gap-2"
          >
            {editingIndex !== null ? 'Guardar cambios' : 'Confirmar pregunta'}
          </Button>
        </div>
      )}

      {/* Botón para agregar nueva pregunta */}
      {!isCreatingNew && (
        <Button
          type="button"
          variant="neutral"
          onClick={handleStartNewQuestion}
          className="w-full flex items-center justify-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Agregar pregunta
        </Button>
      )}

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
    days: 7,
    file: null,
  });

  useEffect(() => {
    if (formData.description && formData.description.trim()) {
      onChange(formData);
    } else if (!formData.description || !formData.description.trim()) {
      onChange(null); // No hay evaluación válida sin descripción
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

        <div className="-mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Días para completar la evaluación <span className="text-red-600">*</span>
          </label>
          <InputField
            type="number"
            min="1"
            max="30"
            placeholder="7"
            value={formData.days}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || value === null) {
                setFormData(prev => ({ ...prev, days: '' }));
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
                  setFormData(prev => ({ ...prev, days: numValue }));
                }
              }
            }}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Entre 1 y 30 días (por defecto: 7 días)
          </p>
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
          {formData.file ? (
            <p className="text-xs text-gray-600 mt-1 break-words">
              Archivo: {formData.file.name}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Ningún archivo seleccionado
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
