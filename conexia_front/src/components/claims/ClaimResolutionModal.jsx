/**
 * ClaimResolutionModal Component
 * Modal para que admin/moderador resuelva o rechace un reclamo
 * Incluye 3 tipos de resolución: A favor del cliente, A favor del proveedor, Acuerdo parcial
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, User, Briefcase, HandshakeIcon, Plus, Trash2, Check } from 'lucide-react';
import { getClaimDetail, resolveClaim } from '@/service/claims';
import { CLAIM_VALIDATION, CLAIM_RESOLUTION_TYPES, CLAIM_RESOLUTION_CONFIG, getClaimTypeLabel, COMPLIANCE_TYPES, COMPLIANCE_TYPE_LABELS } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import Button from '@/components/ui/Button';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';

export const ClaimResolutionModal = ({ isOpen, onClose, claim, onSuccess, showToast }) => {
  const [resolutionType, setResolutionType] = useState(CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR);
  const [resolution, setResolution] = useState('');
  const [partialAgreementDetails, setPartialAgreementDetails] = useState('');
  const [compliances, setCompliances] = useState([]);
  const [editingComplianceId, setEditingComplianceId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const baseClaimId = claim?.claim?.id || claim?.id;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !baseClaimId) return;

      // Limpiar estado de compromisos al abrir modal
      setCompliances([]);
      setEditingComplianceId(null);
      setResolutionType(CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR);
      setResolution('');
      setPartialAgreementDetails('');
      setError(null);

      if (claim?.claim && claim?.claimant && claim?.otherUser) {
        setDetail(claim);
        return;
      }

      try {
        setIsLoadingDetail(true);
        const result = await getClaimDetail(baseClaimId);
        setDetail(result);
      } catch (err) {
        console.error('Error fetching claim detail for resolution modal:', err);
        setDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [isOpen, baseClaimId, claim]);

  const normalized = useMemo(() => {
    const claimData = detail?.claim ? detail : (claim?.claim ? claim : null);
    const claimObj = claimData?.claim || claim || null;

    const getFirstName = (fullName) => {
      if (!fullName) return '';
      const trimmed = String(fullName).trim();
      if (!trimmed) return '';
      return trimmed.split(/\s+/)[0] || '';
    };

    const displayFromProfile = (profile) => {
      if (!profile) return 'N/A';
      const firstName = getFirstName(profile.name);
      const lastName = profile.lastName ? String(profile.lastName).trim() : '';
      return `${firstName} ${lastName}`.trim() || profile.name || 'N/A';
    };

    const claimantName = claimData?.claimant?.profile
      ? displayFromProfile(claimData.claimant.profile)
      : (claimObj?.claimantFirstName && claimObj?.claimantLastName)
        ? `${claimObj.claimantFirstName} ${claimObj.claimantLastName}`
        : claimObj?.claimantName || 'N/A';

    const claimedName = claimData?.otherUser?.profile
      ? displayFromProfile(claimData.otherUser.profile)
      : (claimObj?.claimedUserFirstName && claimObj?.claimedUserLastName)
        ? `${claimObj.claimedUserFirstName} ${claimObj.claimedUserLastName}`
        : claimObj?.claimedUserName || 'N/A';

    const serviceTitle =
      claimData?.hiring?.service?.title ||
      claimObj?.hiring?.service?.title ||
      claimObj?.hiring?.serviceTitle ||
      'N/A';

    const description = claimData?.claim?.description || claimObj?.description || '';
    const evidenceUrls = claimData?.claim?.evidenceUrls || claimObj?.evidenceUrls || [];
    const currentStatus = claimData?.claim?.status || claimObj?.status || '';

    const claimType = claimData?.claim?.claimType || claimObj?.claimType;
    const otherReason = claimData?.claim?.otherReason || claimObj?.otherReason;
    const baseTypeLabel = claimObj?.claimTypeLabel || getClaimTypeLabel(claimType) || claimType;
    
    // Verificar si es tipo "Otro" (client_other o provider_other)
    const isOtherType = claimType === 'client_other' || claimType === 'provider_other';
    const claimTypeLabel = isOtherType && otherReason
      ? (String(baseTypeLabel).includes('(especificar)')
        ? String(baseTypeLabel).replace('(especificar)', `(${otherReason})`)
        : `Otro (${otherReason})`)
      : baseTypeLabel;

    // Extraer IDs correctamente - el backend devuelve profile.id
    const claimantUserId = claimData?.claimant?.profile?.id || claimData?.claimant?.id || claimData?.claimant?.userId;
    const otherUserId = claimData?.otherUser?.profile?.id || claimData?.otherUser?.id || claimData?.otherUser?.userId;

    // Debug: Ver qué IDs tenemos
    console.log('[ClaimResolutionModal] User IDs:', {
      claimantUserId,
      otherUserId,
      claimantData: claimData?.claimant,
      otherUserData: claimData?.otherUser
    });

    return {
      claimId: claimObj?.id,
      claimType,
      claimTypeLabel,
      claimantName,
      claimedName,
      claimantRole: claimObj?.claimantRole,
      claimantId: claimantUserId,
      otherUserId: otherUserId,
      serviceTitle,
      description,
      evidenceUrls,
      status: currentStatus,
    };
  }, [claim, detail]);

  // Funciones para manejar compliances
  const addCompliance = () => {
    const newId = Date.now();
    setCompliances([
      ...compliances,
      {
        id: newId,
        responsibleUserId: '',
        complianceType: COMPLIANCE_TYPES.CONFIRMATION_ONLY,
        instructions: '',
        deadlineDays: 7,
        order: compliances.length,
        isConfirmed: false,
      },
    ]);
    setEditingComplianceId(newId);
  };

  const removeCompliance = (id) => {
    setCompliances(compliances.filter((c) => c.id !== id));
    if (editingComplianceId === id) {
      setEditingComplianceId(null);
    }
  };

  const updateCompliance = (id, field, value) => {
    setCompliances(
      compliances.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const confirmCompliance = (id) => {
    const compliance = compliances.find((c) => c.id === id);
    if (!compliance) return;

    // Validar campos antes de confirmar
    if (!compliance.responsibleUserId) {
      setError('Debes seleccionar un responsable');
      return;
    }
    if (!compliance.complianceType) {
      setError('Debes seleccionar un tipo de compromiso');
      return;
    }
    if (compliance.instructions.trim().length < 20) {
      setError('Las instrucciones deben tener al menos 20 caracteres');
      return;
    }
    if (compliance.instructions.trim().length > 1000) {
      setError('Las instrucciones no pueden exceder 1000 caracteres');
      return;
    }
    if (compliance.deadlineDays < 1 || compliance.deadlineDays > 60) {
      setError('El plazo debe estar entre 1 y 60 días');
      return;
    }

    setCompliances(
      compliances.map((c) =>
        c.id === id ? { ...c, isConfirmed: true } : c
      )
    );
    setEditingComplianceId(null);
    setError(null);
  };

  const editCompliance = (id) => {
    setEditingComplianceId(id);
  };

  const cancelEditCompliance = () => {
    const editing = compliances.find(c => c.id === editingComplianceId);
    // Si el compromiso ya está confirmado, solo cancelamos la edición
    // Si es un compromiso nuevo sin confirmar, lo eliminamos
    if (editing && !editing.isConfirmed) {
      setCompliances(compliances.filter(c => c.id !== editingComplianceId));
    }
    setEditingComplianceId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedResolution = resolution.trim();

    if (trimmedResolution.length < CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH) {
      setError(`La resolución debe tener al menos ${CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH} caracteres`);
      return;
    }

    if (trimmedResolution.length > CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH) {
      setError(`La resolución no puede exceder ${CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH} caracteres`);
      return;
    }

    if (
      resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT &&
      partialAgreementDetails.trim().length > CLAIM_VALIDATION.PARTIAL_AGREEMENT_MAX_LENGTH
    ) {
      setError(`Los detalles del acuerdo no pueden exceder ${CLAIM_VALIDATION.PARTIAL_AGREEMENT_MAX_LENGTH} caracteres`);
      return;
    }

    // Verificar si hay un compromiso en edición sin confirmar
    if (editingComplianceId !== null) {
      setError('Debes confirmar o cancelar el compromiso actual antes de continuar');
      return;
    }

    // Validar compromisos confirmados
    const confirmedCompliances = compliances.filter(c => c.isConfirmed);
    for (const compliance of confirmedCompliances) {
      if (!compliance.responsibleUserId) {
        setError('Todos los compromisos deben tener un responsable asignado');
        return;
      }
      if (!compliance.complianceType) {
        setError('Todos los compromisos deben tener un tipo seleccionado');
        return;
      }
      if (compliance.instructions.trim().length < 20) {
        setError('Las instrucciones de cada compromiso deben tener al menos 20 caracteres');
        return;
      }
      if (compliance.instructions.trim().length > 1000) {
        setError('Las instrucciones de cada compromiso no pueden exceder 1000 caracteres');
        return;
      }
      if (compliance.deadlineDays < 1 || compliance.deadlineDays > 60) {
        setError('El plazo de cada compromiso debe estar entre 1 y 60 días');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resolutionData = {
        status: 'resolved',
        resolution: trimmedResolution,
        resolutionType: resolutionType,
      };
      
      // Agregar solo compromisos confirmados si existen
      const confirmedCompliances = compliances.filter(c => c.isConfirmed);
      
      // Debug: Ver qué compromisos se están enviando
      console.log('[DEBUG] Enviando resolución con compromisos:', {
        totalCompliances: compliances.length,
        confirmedCompliances: confirmedCompliances.length,
        allCompliances: compliances,
        confirmedOnly: confirmedCompliances
      });
      
      // VALIDACIÓN EXTRA: Verificar que no se excedan 5 compromisos
      if (confirmedCompliances.length > 5) {
        setError(`Error: Se detectaron ${confirmedCompliances.length} compromisos confirmados. El máximo es 5. Por favor, recarga la página.`);
        setIsSubmitting(false);
        return;
      }
      
      if (confirmedCompliances.length > 0) {
        // Crear array de compromisos únicos (por si acaso)
        const uniqueCompliances = confirmedCompliances.filter((compliance, index, self) =>
          index === self.findIndex((c) => c.id === compliance.id)
        );
        
        console.log('[DEBUG] Compromisos únicos después de filtrar:', uniqueCompliances);
        
        resolutionData.compliances = uniqueCompliances.map((c, index) => ({
          responsibleUserId: Number(c.responsibleUserId),
          complianceType: c.complianceType,
          instructions: c.instructions.trim(),
          deadlineDays: Number(c.deadlineDays),
          order: index,
        }));
        
        console.log('[DEBUG] Compromisos a enviar al backend:', resolutionData.compliances);
      }

      if (resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT && partialAgreementDetails.trim()) {
        resolutionData.partialAgreementDetails = partialAgreementDetails.trim();
      }

      const updatedClaim = await resolveClaim(normalized.claimId, resolutionData);

      // Cerrar modal inmediatamente
      handleClose();

      // Mostrar toast en la página padre
      if (showToast) {
        showToast('success', 'Reclamo resuelto exitosamente. Las partes serán notificadas.');
      }

      // Actualizar claim en el padre
      if (onSuccess) {
        onSuccess(updatedClaim);
      }
    } catch (err) {
      console.error('Error resolving claim:', err);
      
      // Mostrar error en la página padre
      if (showToast) {
        showToast('error', err.message || 'Error al procesar la resolución. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setResolutionType(CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR);
      setResolution('');
      setPartialAgreementDetails('');
      setCompliances([]);
      setEditingComplianceId(null);
      setError(null);
    }
  };

  const characterCount = resolution.trim().length;
  const minLength = CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH;
  const maxLength = CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Resolver reclamo
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form envuelve content y footer */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Content (solo esta sección hace scroll) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg text-gray-900">Información del reclamo</h3>
                {isLoadingDetail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando detalle...
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Reclamo</p>
                  <ClaimTypeBadge
                    claimType={normalized.claimType}
                    labelOverride={normalized.claimTypeLabel}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado</p>
                  <ClaimStatusBadge status={normalized.status} />
                </div>
                <p className="text-gray-700">
                  <span className="font-medium">Reclamante:</span>{' '}
                  {normalized.claimantName}{' '}
                  {normalized.claimantRole
                    ? `(${normalized.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})`
                    : ''}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Reclamado:</span>{' '}
                  {normalized.claimedName}{' '}
                  {normalized.claimantRole
                    ? `(${normalized.claimantRole === 'client' ? 'Proveedor' : 'Cliente'})`
                    : ''}
                </p>
                <p className="text-gray-700 md:col-span-2">
                  <span className="font-medium">Servicio:</span> {normalized.serviceTitle}
                </p>
              </div>
            </div>

            {/* Descripción del Reclamo */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Descripción del Reclamo</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {normalized.description || 'No hay descripción disponible'}
              </p>
            </div>

            {/* Evidencias actuales */}
            {normalized.evidenceUrls?.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Evidencias del reclamo</h3>
                <ClaimEvidenceViewer evidenceUrls={normalized.evidenceUrls} />
              </div>
            )}

            {/* Tipo de Resolución y Descripción agrupados */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-conexia-green-dark mb-4">Resolución del Reclamo</h3>
              
              {/* Tipo de resolución */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-conexia-green-dark mb-3">
                  Tipo de resolución <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* A favor del cliente */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud: {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].hiringStatusLabel}
                      </p>
                    </div>
                  </label>

                  {/* A favor del proveedor */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={18} className="text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].hiringStatusLabel}
                      </p>
                    </div>
                  </label>

                  {/* Acuerdo parcial */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <HandshakeIcon size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud: {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].hiringStatusLabel}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Campo de resolución/explicación - AHORA DENTRO DEL MISMO COMPONENTE */}
              <div className="border-t pt-6 mt-6">
                <label htmlFor="resolution" className="block text-sm font-semibold text-conexia-green-dark mb-2">
                  Explicación de la Resolución <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={8}
                  name="resolution"
                  placeholder="Explica detalladamente la resolución del reclamo, qué se decidió y por qué..."
                  value={resolution}
                  onChange={(e) => {
                    setResolution(e.target.value);
                    setError(null);
                  }}
                  maxLength={maxLength}
                  disabled={isSubmitting}
                  showCharCount={true}
                  error={error}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {minLength} caracteres
                </p>
              </div>
            </div>

            {/* Compromisos a asignar */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-conexia-green-dark">Compromisos a Asignar</h3>
                <p className="text-sm text-gray-600 mt-1">Define las acciones que cada parte debe cumplir para resolver el reclamo</p>
              </div>

              {/* Lista de compromisos confirmados - COMPACTO */}
              {compliances.filter(c => c.isConfirmed).length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-gray-700">Compromisos agregados ({compliances.filter(c => c.isConfirmed).length}):</p>
                  {compliances.filter(c => c.isConfirmed).map((compliance) => {
                    const responsibleName = 
                      String(compliance.responsibleUserId) === String(normalized.claimantId) 
                        ? normalized.claimantName 
                        : normalized.claimedName;
                    
                    return (
                      <div key={compliance.id} className="bg-green-50 border border-green-200 rounded-lg p-3 relative">
                        {/* Iconos de acciones en la esquina superior derecha */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => editCompliance(compliance.id)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100 transition-colors"
                            disabled={isSubmitting || editingComplianceId !== null}
                            title="Editar compromiso"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCompliance(compliance.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                            disabled={isSubmitting || editingComplianceId !== null}
                            title="Eliminar compromiso"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Contenido del compromiso */}
                        <div className="pr-12">
                          <div className="flex items-center gap-1 mb-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="font-semibold text-gray-900 text-xs">{COMPLIANCE_TYPE_LABELS[compliance.complianceType]}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Responsable:</span> {responsibleName} | 
                              <span className="font-medium"> Plazo:</span> {compliance.deadlineDays} días
                            </p>
                            <p className="text-gray-700"><span className="font-medium">Instrucciones:</span> {compliance.instructions}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulario para agregar/editar compromiso - COMPACTO */}
              {editingComplianceId !== null && (() => {
                const editingCompliance = compliances.find(c => c.id === editingComplianceId);
                if (!editingCompliance) return null;

                // Debug: Ver qué IDs tenemos disponibles
                console.log('Datos de usuarios para compromisos:', {
                  claimantId: normalized.claimantId,
                  claimantName: normalized.claimantName,
                  otherUserId: normalized.otherUserId,
                  otherUserName: normalized.claimedName,
                  detail: detail
                });

                return (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-3">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-conexia-green-dark">
                        {editingCompliance.isConfirmed ? 'Editar Compromiso' : 'Nuevo Compromiso'}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Fila 1: Responsable y Tipo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
                            Responsable <span className="text-red-500">*</span>
                          </label>
                          <SelectField
                            name="responsibleUserId"
                            placeholder="Selecciona responsable"
                            options={[
                              ...(normalized.claimantId ? [{
                                value: String(normalized.claimantId),
                                label: `${normalized.claimantName} (Reclamante)`
                              }] : []),
                              ...(normalized.otherUserId ? [{
                                value: String(normalized.otherUserId),
                                label: `${normalized.claimedName} (Reclamado)`
                              }] : [])
                            ]}
                            value={String(editingCompliance.responsibleUserId)}
                            onChange={(e) => updateCompliance(editingComplianceId, 'responsibleUserId', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
                            Tipo de Compromiso <span className="text-red-500">*</span>
                          </label>
                          <SelectField
                            name="complianceType"
                            placeholder="Selecciona tipo"
                            options={Object.entries(COMPLIANCE_TYPES).map(([key, value]) => ({
                              value: value,
                              label: COMPLIANCE_TYPE_LABELS[value]
                            }))}
                            value={editingCompliance.complianceType}
                            onChange={(e) => updateCompliance(editingComplianceId, 'complianceType', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Fila 2: Plazo */}
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
                            Plazo (días) <span className="text-red-500">*</span>
                          </label>
                          <InputField
                            type="number"
                            name="deadlineDays"
                            placeholder="7"
                            min={1}
                            max={60}
                            value={editingCompliance.deadlineDays}
                            onChange={(e) => updateCompliance(editingComplianceId, 'deadlineDays', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Fila 3: Instrucciones */}
                      <div>
                        <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
                          Instrucciones <span className="text-red-500">*</span>
                        </label>
                        <InputField
                          multiline
                          rows={4}
                          name="instructions"
                          placeholder="Ej: Debes realizar el reembolso del 50% del monto pagado..."
                          value={editingCompliance.instructions}
                          onChange={(e) => updateCompliance(editingComplianceId, 'instructions', e.target.value)}
                          maxLength={1000}
                          showCharCount={true}
                        />
                        <p className="text-xs text-gray-600 mt-1">Mínimo 20 caracteres</p>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                      <Button
                        type="button"
                        onClick={cancelEditCompliance}
                        variant="cancel"
                        disabled={isSubmitting}
                        className="text-sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => confirmCompliance(editingComplianceId)}
                        variant="success"
                        className="flex items-center gap-2 text-sm"
                        disabled={isSubmitting || !editingCompliance.responsibleUserId || !editingCompliance.complianceType || editingCompliance.instructions.trim().length < 20}
                        title={!editingCompliance.responsibleUserId || !editingCompliance.complianceType || editingCompliance.instructions.trim().length < 20 ? 'Completa todos los campos requeridos' : ''}
                      >
                        <Check size={16} />
                        Confirmar
                      </Button>
                    </div>
                  </div>
                );
              })()}

                {/* Botón para agregar nuevo compromiso */}
                {editingComplianceId === null && (
                  <Button
                    type="button"
                    onClick={addCompliance}
                    variant="primary"
                    className="flex items-center gap-2 w-full justify-center"
                    disabled={isSubmitting}
                  >
                    <Plus size={18} />
                    Agregar Compromiso
                  </Button>
                )}

                {compliances.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mt-4">
                    <p className="text-sm text-gray-600">No hay compromisos asignados</p>
                    <p className="text-xs text-gray-500 mt-1">Los compromisos son opcionales. Haz clic en &quot;Agregar Compromiso&quot; si deseas crear uno</p>
                  </div>
                )}
              </div>
            </div>

          {/* Footer (estático) */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
            <Button type="button" onClick={handleClose} disabled={isSubmitting} variant="cancel">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              variant="success"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Resolver reclamo
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimResolutionModal;
