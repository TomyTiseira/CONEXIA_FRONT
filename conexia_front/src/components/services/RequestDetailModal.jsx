'use client';

import { useState } from 'react';
import { X, FileText, Calendar, User, Clock, DollarSign, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { config } from '@/config';
import { getUserDisplayName } from '@/utils/formatUserName';
import QuotationDisplay from '@/components/services/QuotationDisplay';
import { isExpired, getVigencyStatus } from '@/utils/quotationVigency';

export default function RequestDetailModal({ hiring, isOpen, onClose }) {
  if (!isOpen || !hiring) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      pending: 'Pendiente',
      quoted: 'Cotizado',
      requoting: 'Re-cotizando',
      accepted: 'Aceptado',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      negotiating: 'Negociando',
      in_progress: 'En progreso',
      delivered: 'Entregado',
      revision_requested: 'Revisión solicitada',
      completed: 'Completado',
      expired: 'Vencida',
      in_claim: 'En Reclamo',
      cancelled_by_claim: 'Cancelado por reclamo',
      completed_by_claim: 'Finalizado por reclamo',
      completed_with_agreement: 'Finalizado con acuerdo'
    };
    return statusMap[statusCode] || statusCode;
  };

  const getStatusColor = (statusCode) => {
    const statusMap = {
      pending: 'text-yellow-800 bg-yellow-100',
      quoted: 'text-blue-800 bg-blue-100',
      requoting: 'text-sky-800 bg-sky-100',
      accepted: 'text-green-800 bg-green-100',
      approved: 'text-conexia-green bg-conexia-green/10',
      rejected: 'text-red-800 bg-red-100',
      cancelled: 'text-gray-800 bg-gray-100',
      negotiating: 'text-orange-800 bg-orange-100',
      in_progress: 'text-purple-800 bg-purple-100',
      delivered: 'text-teal-800 bg-teal-100',
      revision_requested: 'text-orange-800 bg-orange-100',
      completed: 'text-green-800 bg-green-100'
    };
    return statusMap[statusCode] || 'text-gray-800 bg-gray-100';
  };

  // Derivar información del dueño del servicio desde diferentes formas del payload
  const ownerRaw = hiring.owner || hiring.service?.owner || hiring.service?.user || null;
  const ownerNameFromFull = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      name: parts[0] || '',
      lastName: parts[1] || ''
    };
  };
  const ownerNameFields = ownerRaw?.fullName
    ? ownerNameFromFull(ownerRaw.fullName)
    : { name: ownerRaw?.firstName ?? ownerRaw?.name ?? '', lastName: ownerRaw?.lastName ?? '' };
  const ownerDisplayName = ownerRaw
    ? getUserDisplayName({ name: ownerNameFields.name, lastName: ownerNameFields.lastName })
    : 'Usuario';
  const ownerImage = ownerRaw?.profileImage || ownerRaw?.profilePicture || null;

  // Determinar si hay datos de cotización para mostrar
  const hasQuotation = Boolean(
    hiring?.paymentModality ||
    hiring?.quotedPrice ||
    (Array.isArray(hiring?.deliverables) && hiring.deliverables.length > 0) ||
    (hiring?.estimatedHours && hiring?.estimatedTimeUnit)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-conexia-green">
              Detalles de mi Solicitud
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Información del servicio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} className="text-conexia-green" />
              Servicio Solicitado
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Título:</span>
                <p className="text-gray-900 mt-1">{hiring.service?.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Precio base:</span>
                <p className="text-conexia-green font-semibold mt-1">
                  ${hiring.service?.price?.toLocaleString()} {hiring.service?.currency}
                </p>
              </div>
              {ownerRaw && (
                <div>
                  <span className="font-medium text-gray-700">Dueño del servicio:</span>
                  <div className="mt-1 flex items-center gap-2">
                    {ownerImage ? (
                      <img
                        src={`${config.IMAGE_URL}/${ownerImage}`}
                        alt={ownerDisplayName}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={14} className="text-gray-500" />
                      </div>
                    )}
                    <span className="text-gray-900 font-medium">{ownerDisplayName}</span>
                  </div>
                </div>
              )}
              {hiring.service?.description && (
                <div>
                  <span className="font-medium text-gray-700">Descripción del servicio:</span>
                  <div className="text-gray-900 mt-1 bg-white p-3 rounded border break-words overflow-wrap-anywhere">
                    {hiring.service.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mi solicitud */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Mi Solicitud
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Descripción de lo solicitado:</span>
                <p className="text-gray-900 mt-1 bg-white p-3 rounded border">
                  {hiring.description || 'Sin descripción específica'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Fecha de solicitud:</span>
                  <p className="text-gray-900 mt-1 flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(hiring.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado actual:</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(hiring.status?.code)}`}>
                      {getStatusLabel(hiring.status?.code)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cotización del Proveedor (si existe) */}
          {hasQuotation && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign size={20} className="text-green-700" />
                Cotización del Proveedor
              </h3>
              {/* Regla: solo mostrar "Cotización Vencida" cuando el estado es 'quoted' Y está vencida */}
              {isExpired(hiring) && hiring.status?.code === 'quoted' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Cotización Vencida</h4>
                      <p className="text-sm text-red-600">
                        Esta cotización ha expirado. La única acción disponible es cancelar la solicitud para poder volver a cotizar este servicio.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded border p-3">
                  <QuotationDisplay quotation={hiring} />
                  {hiring.quotationValidityDays && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Vigencia de la cotización</p>
                          <p className={`text-base font-bold ${getVigencyStatus(hiring).className}`}>
                            {getVigencyStatus(hiring).text}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Válida por {hiring.quotationValidityDays} {hiring.quotationValidityDays === 1 ? 'día' : 'días'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          
        </div>

        {/* Footer fijo */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex-shrink-0">
          <div className="flex justify-end">
            <Button variant="cancel" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}