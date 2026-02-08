/**
 * SubmitObservationsModal Component
 * Modal para que el reclamado envíe observaciones al reclamo
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useClaimActions } from '@/hooks/claims';
import { getClaimDetail } from '@/service/claims';
import { CLAIM_VALIDATION, isValidClaimFile } from '@/constants/claims';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { ClaimEvidenceViewer } from '@/components/claims/ClaimEvidenceViewer';

export const SubmitObservationsModal = ({ claim, onClose, onSuccess }) => {
  const { sendObservations, loading } = useClaimActions();
  const [observations, setObservations] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const baseClaimId = claim?.claim?.id || claim?.id;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!baseClaimId) return;

      if (claim?.claim && claim?.claimant && claim?.otherUser) {
        setDetail(claim);
        return;
      }

      try {
        setIsLoadingDetail(true);
        const result = await getClaimDetail(baseClaimId);
        setDetail(result);
      } catch (err) {
        console.error('Error fetching claim detail for submit observations modal:', err);
        setDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [baseClaimId, claim]);

  const claimObj = useMemo(() => {
    return detail?.claim || claim?.claim || claim || {};
  }, [detail, claim]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    setError('');
    
    if (files.length + newFiles.length > 5) {
      setError('Máximo 5 archivos permitidos');
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (!isValidClaimFile(file)) {
        setError(`${file.name}: formato no válido o tamaño mayor a 10MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addFiles(droppedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!observations.trim()) {
      setError('Las observaciones son requeridas');
      return;
    }

    if (observations.length < CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH) {
      setError(`Mínimo ${CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH} caracteres`);
      return;
    }

    const formData = new FormData();
    formData.append('observations', observations);
    files.forEach((file) => {
      formData.append('evidenceFiles', file);
    });

    const result = await sendObservations(claimObj.id, formData);
    
    if (result.success) {
      onSuccess?.('Observaciones enviadas exitosamente');
      onClose();
    } else {
      setError(result.error || 'Error al enviar observaciones');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Enviar Observaciones</h2>
            {isLoadingDetail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 size={16} className="animate-spin" />
                Cargando detalle...
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Como reclamado, puedes responder al reclamo proporcionando tus observaciones y evidencias adicionales.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Contexto del Reclamo</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {claimObj.description || 'No hay descripción disponible'}
            </p>
            {claimObj.evidenceUrls?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Evidencias del reclamo</p>
                <ClaimEvidenceViewer evidenceUrls={claimObj.evidenceUrls} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones <span className="text-red-500">*</span>
            </label>
            <InputField
              multiline
              rows={6}
              name="observations"
              placeholder="Describe tu respuesta al reclamo..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              maxLength={CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH}
              disabled={loading}
              showCharCount={true}
              error={error}
            />
            <p className="text-xs text-gray-500 mt-1">
              {observations.length}/{CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH} caracteres
              (mínimo {CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos de Evidencia (Opcional)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-conexia-green bg-emerald-50' : 'border-gray-300'
              }`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.mp4"
                className="hidden"
                id="file-upload-obs"
              />
              <label
                htmlFor="file-upload-obs"
                className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors"
              >
                Seleccionar Archivos
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Máximo 5 archivos. Formatos: JPG, PNG, GIF, PDF, DOCX, MP4 (10MB máx)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
          <Button type="button" onClick={onClose} disabled={loading} variant="cancel">
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !observations.trim() || observations.length < CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH}
            variant="success"
            className="flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Enviando...' : 'Enviar Observaciones'}
          </Button>
        </div>
      </div>
    </div>
  );
};
