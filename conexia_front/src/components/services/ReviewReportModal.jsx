import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { MdErrorOutline } from 'react-icons/md';

// Motivos alineados con el enum del backend
const REPORT_REASONS = [
  { value: 'Contenido ofensivo o inapropiado', label: 'Contenido ofensivo o inapropiado' },
  { value: 'Spam o contenido irrelevante', label: 'Spam o contenido irrelevante' },
  { value: 'Reseña falsa o fraudulenta', label: 'Reseña falsa o fraudulenta' },
  { value: 'Información personal sensible', label: 'Información personal sensible' },
  { value: 'Otro', label: 'Otro' }
];

export default function ReviewReportModal({ open, onClose, onConfirm, loading = false }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (!open) {
      setSelectedReason('');
      setOtherReason('');
      setDescription('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors = [];
    
    if (!selectedReason) {
      newErrors.push('Debes seleccionar un motivo.');
    }
    
    // Si el motivo es "Otro", validar que otherReason no esté vacío
    if (selectedReason === 'Otro') {
      if (!otherReason || otherReason.trim().length < 3) {
        newErrors.push('Debes especificar el motivo (mínimo 3 caracteres).');
      } else if (otherReason.length > 100) {
        newErrors.push('El motivo personalizado no puede exceder 100 caracteres.');
      }
    }
    
    if (!description || description.trim().length < 10) {
      newErrors.push('La descripción es obligatoria (mínimo 10 caracteres).');
    } else if (description.length > 500) {
      newErrors.push('La descripción no puede exceder 500 caracteres.');
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }
    
    // Construir el objeto de datos según el motivo seleccionado
    const reportData = {
      reason: selectedReason,
      description: description.trim()
    };
    
    // Solo incluir otherReason si el motivo es "Otro"
    if (selectedReason === 'Otro' && otherReason.trim()) {
      reportData.otherReason = otherReason.trim();
    }
    
    onConfirm(reportData);
  };

  const handleClose = () => {
    setSelectedReason('');
    setOtherReason('');
    setDescription('');
    setError('');
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">Reportar reseña</h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Banner informativo */}
          <div className="flex items-start gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
            <MdErrorOutline size={22} className="text-conexia-coral flex-shrink-0 mt-0.5" />
            <div className="text-conexia-coral text-xs">
              <div className="font-semibold">¿Por qué reportar esta reseña?</div>
              <div className="mt-0.5 leading-tight">
                Al reportar una reseña, ayudas a mantener la comunidad segura y confiable. El reporte será revisado por nuestro equipo y, si corresponde, se tomarán las medidas necesarias. El autor de la reseña no sabrá quién realizó el reporte.
                <br />
                <span className="text-xs font-semibold">Importante: Si realizas reportes falsos de manera reiterada, tu cuenta podrá ser suspendida o dada de baja.</span>
              </div>
            </div>
          </div>

          {/* Motivos de reporte */}
          <div className="mb-4">
            <label className="block text-conexia-green font-semibold mb-2">
              Motivos de reporte <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2 ml-6">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-2 cursor-pointer select-none text-base"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={loading}
                    className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                    style={{ accentColor: '#145750' }}
                  />
                  <span className="text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campo de motivo personalizado (solo si selecciona "Otro") */}
          {selectedReason === 'Otro' && (
            <div className="mb-4">
              <label className="block text-conexia-green font-semibold mb-2">
                Especifica el motivo <span className="text-red-500">*</span>
              </label>
              <InputField
                type="text"
                placeholder="Ej: Reseña duplicada, Error en la información..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                name="otherReason"
                maxLength={100}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {otherReason.length}/100 caracteres
              </p>
            </div>
          )}

          {/* Descripción */}
          <div className="mb-4">
            <label className="block text-conexia-green font-semibold mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <InputField
              multiline
              rows={3}
              placeholder="Describe el motivo del reporte..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              name="description"
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Mensaje de error único y centrado */}
          {error && (
            <div className="flex justify-center">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-2">
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Aceptar'}
          </Button>
          <Button
            type="button"
            variant="cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar el modal en un portal para evitar problemas de z-index
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
