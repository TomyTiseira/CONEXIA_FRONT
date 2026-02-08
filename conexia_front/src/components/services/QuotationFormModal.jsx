'use client';

import { useState, useEffect } from 'react';
import { useQuotations } from '@/hooks/service-hirings/useQuotations';
import { usePaymentModalities } from '@/hooks/service-hirings/usePaymentModalities';
import { useQuotationErrorHandler } from '@/hooks/service-hirings/useQuotationErrorHandler';
import { useHiringStatusUpdater } from '@/hooks/service-hirings/useHiringStatusUpdater';
import { X, DollarSign, Clock, FileText, Calendar, Briefcase, User } from 'lucide-react';
import { getUnitLabel, getTimeUnitOptions } from '@/utils/timeUnit';
import { validateQuotationWithModality, prepareQuotationData } from '@/utils/quotationValidation';
import Button from '@/components/ui/Button';
import { getUserDisplayName } from '@/utils/formatUserName';
import PaymentAccountRequiredModal from './PaymentAccountRequiredModal';
import UserBannedModal from './UserBannedModal';
import PaymentModalitySelector from './PaymentModalitySelector';
import DeliverablesGrid from './DeliverablesGrid';

export default function QuotationFormModal({ hiring, isOpen, isEditing = false, onClose, onSuccess, onError, onHiringUpdate }) {
  const { createQuoteWithModality, updateQuoteWithModality, loading } = useQuotations();
  const { 
    modalities, 
    loading: loadingModalities, 
    loadModalities, 
    getModalityById,
    isFullPayment,
    isByDeliverables 
  } = usePaymentModalities();
  const {
    showPaymentAccountModal,
    showUserBannedModal,
    handleQuotationError,
    closePaymentAccountModal,
    closeUserBannedModal
  } = useQuotationErrorHandler();
  const { markAsRejectedDueToBannedUser } = useHiringStatusUpdater();
  
  const [formData, setFormData] = useState({
    paymentModalityId: null,
    quotedPrice: '',
    estimatedHours: '',
    estimatedTimeUnit: '',
    quotationNotes: '',
    quotationValidityDays: '',
    isBusinessDays: false,
    hoursPerDay: '',
    workOnBusinessDaysOnly: false,
    deliverables: []
  });
  const [errors, setErrors] = useState({});

  // Cargar modalidades al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadModalities();
    }
  }, [isOpen]);

  // Inicializar formulario cuando cambie el hiring o modo de edición
  useEffect(() => {
    if (hiring && isOpen) {
      const initialData = {
        paymentModalityId: isEditing && hiring.paymentModality?.id ? hiring.paymentModality.id : null,
        quotedPrice: isEditing && hiring.quotedPrice ? hiring.quotedPrice.toString() : '',
        estimatedHours: isEditing && hiring.estimatedHours ? hiring.estimatedHours.toString() : '',
        estimatedTimeUnit: isEditing && hiring.estimatedTimeUnit ? hiring.estimatedTimeUnit : '',
        quotationNotes: isEditing && hiring.quotationNotes ? hiring.quotationNotes : '',
        quotationValidityDays: isEditing && hiring.quotationValidityDays ? hiring.quotationValidityDays.toString() : '',
        isBusinessDays: isEditing && hiring.isBusinessDays ? hiring.isBusinessDays : false,
        hoursPerDay: isEditing && hiring.hoursPerDay ? hiring.hoursPerDay.toString() : '',
        workOnBusinessDaysOnly: isEditing && hiring.workOnBusinessDaysOnly ? hiring.workOnBusinessDaysOnly : false,
        deliverables: isEditing && hiring.deliverables ? hiring.deliverables.map(d => ({
          title: d.title,
          description: d.description,
          estimatedDeliveryDate: d.estimatedDeliveryDate?.split('T')[0] || '',
          price: d.price.toString()
        })) : []
      };
      setFormData(initialData);
      setErrors({});
    }
  }, [hiring, isEditing, isOpen]);

  if (!isOpen || !hiring) return null;

  const selectedModality = getModalityById(formData.paymentModalityId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario según la modalidad
    const validationErrors = validateQuotationWithModality(formData, selectedModality);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // No disparar Toast aquí: solo mostrar errores debajo de los campos
      return;
    }

    try {
      // Preparar datos para enviar al API
      const quotationData = prepareQuotationData(formData, selectedModality);

      if (isEditing) {
        await updateQuoteWithModality(hiring.id, quotationData);
        onSuccess?.('Cotización actualizada exitosamente');
      } else {
        await createQuoteWithModality(hiring.id, quotationData);
        onSuccess?.('Cotización creada exitosamente');
      }

      onClose();
    } catch (error) {
      // Intentar manejar errores específicos primero
      const wasHandled = handleQuotationError(error);
      
      // Si no se manejó como error específico, mostrar error genérico
      if (!wasHandled) {
        onError?.(error.message || 'Error al procesar la cotización');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
          <div
            className="relative z-10 bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-conexia-green flex items-center gap-2">
                  {isEditing ? <>Editar cotización</> : <>Crear cotización</>}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                {/* Contenido scrolleable: incluye servicio, solicitud y formulario */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
              {/* Información del servicio */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-conexia-green mb-2 flex items-center gap-2">
                  <Briefcase size={18} className="text-conexia-green" />
                  Mi servicio
                </h4>
                <p className="text-sm font-medium text-gray-900 mb-1 break-words">
                  {hiring.service?.title}
                </p>
                <p className="text-xs text-gray-600">
                  Precio base: ${hiring.service?.price?.toLocaleString()}{hiring.service?.timeUnit ? ` por ${getUnitLabel(hiring.service.timeUnit)}` : ''} {hiring.service?.currency}
                </p>
              </div>
              {/* Solicitud del cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Lo que solicita el cliente
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  Cliente: {getUserDisplayName({ name: hiring.name, lastName: hiring.lastName })} • {formatDate(hiring.createdAt)}
                </p>
                <div className="text-sm text-gray-900 bg-white p-3 rounded border break-words overflow-wrap-anywhere">
                  {hiring.description || 'Sin descripción específica'}
                </div>
              </div>

              {/* Descripción de Negociación (si existe) */}
              {hiring.negotiationDescription && hiring.status?.code === 'negotiating' && (
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                  <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                    🤝 <span>Solicitud de negociación</span>
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    El cliente quiere negociar:
                  </p>
                  <div className="text-sm text-gray-900 bg-white p-3 rounded border border-yellow-300 break-words overflow-wrap-anywhere">
                    {hiring.negotiationDescription}
                  </div>
                </div>
              )}

              {/* Formulario de cotización */}
              <div className="space-y-5">
                <h4 className="font-medium text-gray-900">Detalles de la cotización</h4>
                
                {/* Selector de modalidad de pago */}
                {loadingModalities ? (
                  <div className="text-center py-4 text-gray-500">
                    Cargando modalidades de pago...
                  </div>
                ) : (
                  <PaymentModalitySelector
                    modalities={modalities}
                    selectedId={formData.paymentModalityId}
                    onChange={(id) => handleInputChange('paymentModalityId', id)}
                    disabled={loading}
                  />
                )}
                {errors.paymentModalityId && (
                  <p className="text-sm text-red-600 -mt-2">{errors.paymentModalityId}</p>
                )}

                {/* Campos condicionales según modalidad */}
                {formData.paymentModalityId && (
                  <>
                    {/* Modalidad: Pago Total al Finalizar */}
                    {isFullPayment(formData.paymentModalityId) && (
                      <div>
                        <label htmlFor="quotedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign size={16} className="inline mr-1" />
                          Precio total *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            id="quotedPrice"
                            step="0.01"
                            min="0"
                            value={formData.quotedPrice}
                            onChange={(e) => handleInputChange('quotedPrice', e.target.value)}
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                              errors.quotedPrice ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            disabled={loading}
                          />
                        </div>
                        {errors.quotedPrice && (
                          <p className="text-sm text-red-600 mt-1">{errors.quotedPrice}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Precio base del servicio: ${hiring.service?.price?.toLocaleString()}{hiring.service?.timeUnit ? ` por ${getUnitLabel(hiring.service.timeUnit)}` : ''}
                        </p>
                      </div>
                    )}

                    {/* Modalidad: Pago por Entregables */}
                    {isByDeliverables(formData.paymentModalityId) && (
                      <DeliverablesGrid
                        deliverables={formData.deliverables}
                        onChange={(deliverables) => handleInputChange('deliverables', deliverables)}
                        errors={errors}
                        disabled={loading}
                      />
                    )}

                    {/* Duración estimada (común para ambas modalidades) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Duración aprox. del servicio *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="number"
                            id="estimatedHours"
                            min="1"
                            value={formData.estimatedHours}
                            onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green text-base ${
                              errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="1"
                            disabled={loading}
                          />
                        </div>
                        <div className="relative">
                          <select
                            id="estimatedTimeUnit"
                            value={formData.estimatedTimeUnit}
                            onChange={(e) => handleInputChange('estimatedTimeUnit', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green text-base appearance-none ${
                              errors.estimatedTimeUnit ? 'border-red-300' : 'border-gray-300'
                            }`}
                            style={{ 
                              WebkitAppearance: 'none', 
                              MozAppearance: 'none',
                              backgroundImage: 'none'
                            }}
                            disabled={loading}
                          >
                            <option value="" style={{ padding: '8px' }}>Seleccionar unidad</option>
                            {getTimeUnitOptions().map(option => (
                              <option key={option.value} value={option.value} style={{ padding: '8px' }}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {(errors.estimatedHours || errors.estimatedTimeUnit) && (
                        <div className="mt-1">
                          {errors.estimatedHours && (
                            <p className="text-sm text-red-600">{errors.estimatedHours}</p>
                          )}
                          {errors.estimatedTimeUnit && (
                            <p className="text-sm text-red-600">{errors.estimatedTimeUnit}</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Tiempo aproximado que te tomará completar el trabajo
                      </p>
                    </div>

                    {/* Horas por día (opcional) */}
                    <div>
                      <label htmlFor="hoursPerDay" className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Horas de trabajo por día (opcional)
                      </label>
                      <input
                        type="number"
                        id="hoursPerDay"
                        min="1"
                        max="24"
                        step="0.5"
                        value={formData.hoursPerDay}
                        onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                          errors.hoursPerDay ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 2, 4, 8"
                        disabled={loading}
                      />
                      {errors.hoursPerDay && (
                        <p className="text-sm text-red-600 mt-1">{errors.hoursPerDay}</p>
                      )}
                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 leading-relaxed">
                          <strong>Transparencia para el cliente:</strong> Indicar las horas diarias ayuda al cliente a comparar cotizaciones de manera más inteligente. Por ejemplo, si dos proveedores cotizan 5 días pero uno trabaja 2 horas/día y otro 8 horas/día, el cliente puede evaluar mejor el valor real del servicio.
                        </p>
                      </div>
                    </div>

                    {/* Checkbox de días hábiles de trabajo */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <input
                        type="checkbox"
                        id="workOnBusinessDaysOnly"
                        checked={formData.workOnBusinessDaysOnly}
                        onChange={(e) => handleInputChange('workOnBusinessDaysOnly', e.target.checked)}
                        className="w-4 h-4 text-conexia-green border-gray-300 rounded focus:ring-conexia-green cursor-pointer"
                        disabled={loading}
                      />
                      <label htmlFor="workOnBusinessDaysOnly" className="text-sm text-gray-700 cursor-pointer select-none">
                        Trabajo solo días hábiles (lunes a viernes)
                      </label>
                    </div>

                    {/* Vigencia de la cotización */}
                    <div>
                      <label htmlFor="quotationValidityDays" className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Vigencia de la cotización (días) *
                      </label>
                      <input
                        type="number"
                        id="quotationValidityDays"
                        min="1"
                        value={formData.quotationValidityDays}
                        onChange={(e) => handleInputChange('quotationValidityDays', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                          errors.quotationValidityDays ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 7"
                        disabled={loading}
                      />
                      {errors.quotationValidityDays && (
                        <p className="text-sm text-red-600 mt-1">{errors.quotationValidityDays}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        La cotización será válida por este número de días
                      </p>
                    </div>

                    {/* Checkbox de días hábiles */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <input
                        type="checkbox"
                        id="isBusinessDays"
                        checked={formData.isBusinessDays}
                        onChange={(e) => handleInputChange('isBusinessDays', e.target.checked)}
                        className="w-4 h-4 text-conexia-green border-gray-300 rounded focus:ring-conexia-green cursor-pointer"
                        disabled={loading}
                      />
                      <label htmlFor="isBusinessDays" className="text-sm text-gray-700 cursor-pointer select-none">
                        Calcular vencimiento en días hábiles (excluye sábados y domingos)
                      </label>
                    </div>

                    {/* Notas adicionales */}
                    <div>
                      <label htmlFor="quotationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="inline mr-1" />
                        Notas Adicionales
                      </label>
                      <textarea
                        id="quotationNotes"
                        rows={4}
                        value={formData.quotationNotes}
                        onChange={(e) => handleInputChange('quotationNotes', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green resize-none ${
                          errors.quotationNotes ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Incluye detalles adicionales sobre el trabajo, materiales, condiciones, etc..."
                        disabled={loading}
                      />
                      {errors.quotationNotes && (
                        <p className="text-sm text-red-600 mt-1">{errors.quotationNotes}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Opcional - Máximo 1000 caracteres ({formData.quotationNotes.length}/1000)
                      </p>
                    </div>
                  </>
                )}
              </div>
              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Consejos para una buena cotización</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sé específico sobre qué incluye el precio</li>
                  <li>• Menciona si hay costos adicionales no incluidos</li>
                  <li>• Establece un tiempo realista para completar el trabajo</li>
                  <li>• Incluye información sobre garantías o revisiones</li>
                </ul>
              </div>
            </div>
                {/* Footer fijo */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0">
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="cancel"
                      className="min-w-[140px]"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="min-w-[180px]" disabled={loading}>
                      {loading
                        ? 'Procesando...'
                        : isEditing
                          ? 'Actualizar cotización'
                          : 'Enviar cotización'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de error específicos */}
      <PaymentAccountRequiredModal
        isOpen={showPaymentAccountModal}
        onClose={() => {
          closePaymentAccountModal();
          // Cerrar también el modal principal cuando se cancela
          onClose();
        }}
      />

      <UserBannedModal
        isOpen={showUserBannedModal}
        onClose={closeUserBannedModal}
        onAccept={() => {
          // Actualizar el estado de la solicitud como rechazada
          if (hiring && onHiringUpdate) {
            markAsRejectedDueToBannedUser(hiring.id, onHiringUpdate);
          }
          onSuccess?.('La solicitud ha sido rechazada automáticamente');
          // Cerrar el modal principal de cotización
          onClose();
        }}
      />
    </>
  );
}