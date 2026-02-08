'use client';

import { CreditCard, Package, DollarSign, Calendar, Clock, FileText } from 'lucide-react';
import { getUnitLabel } from '@/utils/timeUnit';

/**
 * Componente para mostrar una cotización con modalidad de pago y entregables
 * @param {Object} props
 * @param {Object} props.quotation - Datos de la cotización
 * @param {boolean} props.compact - Mostrar versión compacta
 */
export default function QuotationDisplay({ quotation, compact = false }) {
  if (!quotation) return null;

  const { 
    paymentModality, 
    quotedPrice, 
    estimatedHours, 
    estimatedTimeUnit, 
    quotationNotes, 
    deliverables,
    hoursPerDay,
    workOnBusinessDaysOnly 
  } = quotation;

  // Badge de estado para entregables
  const getDeliverableStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
      in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
      delivered: { label: 'Entregado', color: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Modalidad de pago */}
      {paymentModality && (
        <div className="bg-gradient-to-r from-conexia-green to-green-600 text-white rounded-lg p-4">
          <div className="flex items-start gap-3">
            {paymentModality.code === 'full_payment' ? (
              <CreditCard size={24} className="flex-shrink-0 mt-1" />
            ) : (
              <Package size={24} className="flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{paymentModality.name}</h3>
              <p className="text-sm text-green-50 opacity-90">{paymentModality.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información general de la cotización */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiempo estimado */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Duración estimada</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {estimatedHours} {getUnitLabel(estimatedTimeUnit, estimatedHours)}
          </p>
          
          {/* Información adicional de horas por día y días hábiles */}
          {(hoursPerDay || workOnBusinessDaysOnly) && (
            <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
              {hoursPerDay && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{hoursPerDay} horas</span> de trabajo por día
                  </p>
                </div>
              )}
              {workOnBusinessDaysOnly && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <p className="text-sm text-gray-700">
                    Trabaja solo días hábiles (lunes a viernes)
                  </p>
                </div>
              )}
              {hoursPerDay && estimatedHours && estimatedTimeUnit && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Total aproximado:</strong> {hoursPerDay * estimatedHours} horas de trabajo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Precio (solo para pago total) */}
        {paymentModality?.code === 'full_payment' && quotedPrice && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Precio total</span>
            </div>
            <p className="text-2xl font-bold text-conexia-green">
              ${quotedPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
            
            {/* Desglose de pagos */}
            {paymentModality.initialPaymentPercentage && paymentModality.finalPaymentPercentage && (
              <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Anticipo ({paymentModality.initialPaymentPercentage}%):</span>
                  <span className="font-medium text-gray-900">
                    ${(quotedPrice * paymentModality.initialPaymentPercentage / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Al finalizar ({paymentModality.finalPaymentPercentage}%):</span>
                  <span className="font-medium text-gray-900">
                    ${(quotedPrice * paymentModality.finalPaymentPercentage / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entregables (solo para modalidad por entregables) */}
      {paymentModality?.code === 'by_deliverables' && deliverables && deliverables.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} />
              Entregables ({deliverables.length})
            </h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {deliverables.map((deliverable, index) => (
              <div key={deliverable.id || index} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-conexia-green text-white flex items-center justify-center text-sm font-semibold">
                        {deliverable.orderIndex || index + 1}
                      </span>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">{deliverable.title}</h5>
                        <p className="text-sm text-gray-600">{deliverable.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 ml-11 md:ml-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(deliverable.estimatedDeliveryDate)}</span>
                    </div>
                    <div className="font-bold text-lg text-conexia-green">
                      ${deliverable.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </div>
                    {deliverable.status && getDeliverableStatusBadge(deliverable.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total de entregables */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Precio total:</span>
              <span className="text-xl font-bold text-conexia-green">
                ${(() => {
                  const total = deliverables.reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0);
                  return total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notas de la cotización */}
      {quotationNotes && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <FileText size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Notas adicionales</h5>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{quotationNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
