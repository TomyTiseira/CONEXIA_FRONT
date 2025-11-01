import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { MdErrorOutline } from 'react-icons/md';

// Motivos de reporte para reseñas (deben coincidir con el backend)
const REPORT_REASONS = [
  { value: 'Contenido ofensivo', label: 'Contenido ofensivo' },
  { value: 'Acoso', label: 'Acoso' },
  { value: 'Spam', label: 'Spam' },
  { value: 'Información falsa', label: 'Información falsa' },
  { value: 'Otro', label: 'Otro' }
];

export default function ReportReviewModal({ open, onClose, onSubmit, loading, reviewId }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setSelectedReason('');
    setOtherReason('');
    setDescription('');
    setError('');
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  const validateForm = () => {
    if (!selectedReason) {
      return false;
    }
    
    if (selectedReason === 'Otro' && (!otherReason || otherReason.trim().length === 0)) {
      return false;
    }
    
    if (!description || description.trim().length < 10) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedReason) {
      setError('Debes seleccionar un motivo.');
      return;
    }

    if (selectedReason === 'Otro' && !otherReason.trim()) {
      setError('Debes especificar el motivo.');
      return;
    }

    if (!description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    onSubmit({
      reason: selectedReason,
      otherReason: selectedReason === 'Otro' ? otherReason.trim() : undefined,
      description: description.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">Reportar reseña</h2>
        </div>

        {/* Contenido scrollable completo */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Banner informativo */}
          <div className="flex items-start gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
            <MdErrorOutline size={22} className="text-conexia-coral flex-shrink-0 mt-0.5" />
            <div className="text-conexia-coral text-xs">
              <div className="font-semibold">¿Por qué reportar esta reseña?</div>
              <div className="mt-0.5 leading-tight">
                Al reportar una reseña, ayudas a mantener la comunidad segura y respetuosa. El reporte será revisado por nuestro equipo y, si corresponde, se tomarán las medidas necesarias. El autor de la reseña no sabrá quién realizó el reporte.
                <br />
                <span className="text-xs font-semibold">Importante: Solo puedes reportar una reseña una vez. Si realizas reportes falsos de manera reiterada, tu cuenta podrá ser suspendida o dada de baja.</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-conexia-green font-semibold mb-2">
                Motivo del reporte <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 ml-6">
                {REPORT_REASONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none text-base">
                    <input
                      type="radio"
                      checked={selectedReason === opt.value}
                      onChange={() => setSelectedReason(opt.value)}
                      className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                      style={{ accentColor: '#145750' }}
                    />
                    <span className="text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Otro' && (
              <div>
                <label className="block text-conexia-green font-semibold mb-2">
                  Especifica el motivo <span className="text-red-500">*</span>
                </label>
                <InputField
                  type="text"
                  placeholder="Especifica el motivo (Máximo 30 caracteres)"
                  value={otherReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) setOtherReason(e.target.value);
                  }}
                  name="otherReason"
                  maxLength={30}
                  disabled={loading}
                  showCharCount={true}
                />
              </div>
            )}

            <div>
              <label className="block text-conexia-green font-semibold mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <InputField
                multiline
                rows={4}
                placeholder="Describe detalladamente el motivo del reporte... (mínimo 10 caracteres)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="description"
                maxLength={500}
                showCharCount={true}
              />
            </div>

            {/* Mensaje de error único, centrado */}
            {error && (
              <div className="flex justify-center">
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-2">
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || !validateForm()}
          >
            {loading ? 'Procesando...' : 'Aceptar'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
