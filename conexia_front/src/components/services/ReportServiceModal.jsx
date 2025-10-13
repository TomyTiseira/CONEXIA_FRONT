import { useState } from 'react';
import Button from '@/components/ui/Button';

const REPORT_REASONS = [
  { value: 'offensive', label: 'Contenido ofensivo o inapropiado' },
  { value: 'fraud', label: 'Proyecto engañoso o fraudulento' },
  { value: 'false_info', label: 'Información falsa' },
  { value: 'other', label: 'Otro' }
];

export default function ReportServiceModal({ open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [otherText, setOtherText] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!reason) newErrors.reason = 'Debes seleccionar un motivo.';
    if (reason === 'other' && !otherText.trim()) newErrors.otherText = 'Este campo es obligatorio.';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      reason,
      description,
      otherText: reason === 'other' ? otherText : undefined
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <span style={{fontSize: 22}}>&times;</span>
        </button>
        <h2 className="text-xl font-bold mb-4 text-red-600">Reportar servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Motivo</label>
            <div className="space-y-2">
              {REPORT_REASONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value={opt.value}
                    checked={reason === opt.value}
                    onChange={() => setReason(opt.value)}
                    className="accent-red-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>
          {reason === 'other' && (
            <div>
              <label className="block font-medium mb-2">Especifica el motivo</label>
              <input
                type="text"
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                className="w-full border rounded px-3 py-2"
                maxLength={100}
              />
              {errors.otherText && <p className="text-red-500 text-xs mt-1">{errors.otherText}</p>}
            </div>
          )}
          <div>
            <label className="block font-medium mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              maxLength={500}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="flex gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="danger" className="flex-1" disabled={loading}>
              {loading ? 'Enviando...' : 'Aceptar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
