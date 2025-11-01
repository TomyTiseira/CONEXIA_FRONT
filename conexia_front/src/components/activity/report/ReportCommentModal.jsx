import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/form/InputField";
import { MdErrorOutline } from "react-icons/md";

const REPORT_REASONS = [
  { value: "Contenido ofensivo o inapropiado", label: "Contenido ofensivo o inapropiado" },
  { value: "Spam o contenido irrelevante", label: "Spam o contenido irrelevante" },
  { value: "Acoso o intimidación", label: "Acoso o intimidación" },
  { value: "Información falsa", label: "Información falsa" },
  { value: "Otro", label: "Otro" },
];

export default function ReportCommentModal({ onCancel, onSubmit, loading }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const MIN_DESCRIPTION_LENGTH = 10;
  const MAX_DESCRIPTION_LENGTH = 500;
  const MAX_OTHER_REASON_LENGTH = 30;

  useEffect(() => {
    setCharCount(description.length);
  }, [description]);

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
    setError("");
    if (reason !== "Otro") {
      setOtherText("");
    }
  };

  const validateForm = () => {
    if (!selectedReason) {
      return false;
    }
    
    if (selectedReason === "Otro" && (!otherText || otherText.trim().length === 0)) {
      return false;
    }

    if (!description || description.trim().length < MIN_DESCRIPTION_LENGTH) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    setError("");
    
    if (!selectedReason) {
      setError("Debes seleccionar un motivo.");
      return;
    }
    
    if (selectedReason === "Otro" && !otherText.trim()) {
      setError("Debes especificar el motivo.");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setError(`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres.`);
      return;
    }

    onSubmit({
      reason: selectedReason,
      otherReason: selectedReason === "Otro" ? otherText : undefined,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">Reportar comentario</h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-auto px-6 py-4">

        {/* Info Alert */}
        <div className="flex items-start gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
          <MdErrorOutline size={24} className="text-conexia-coral flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-conexia-coral font-semibold text-xs">¿Por qué reportar este comentario?</div>
            <div className="text-conexia-coral text-xs mt-0.5 leading-tight">
              Al reportar un comentario, ayudas a mantener la comunidad segura. El reporte será revisado por nuestro equipo. El autor del comentario no sabrá quién realizó el reporte.
              <br />
              <span className="text-xs text-conexia-coral font-semibold mt-1 inline-block">
                Importante: Los reportes falsos pueden resultar en la suspensión de tu cuenta.
              </span>
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
              <label key={reason.value} className="flex items-center gap-2 cursor-pointer select-none text-base">
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={() => handleReasonChange(reason.value)}
                  disabled={loading}
                  className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                  style={{ accentColor: '#145750' }}
                />
                <span className="text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Especifica el motivo (Condicional) */}
        {selectedReason === "Otro" && (
          <div className="mb-4">
            <label className="block text-conexia-green font-semibold mb-2">
              Especifica el motivo <span className="text-red-500">*</span>
            </label>
            <InputField
              type="text"
              placeholder="Especifica el motivo (Máximo 30 caracteres)"
              value={otherText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_OTHER_REASON_LENGTH) {
                  setOtherText(e.target.value);
                }
              }}
              name="otherReason"
              maxLength={MAX_OTHER_REASON_LENGTH}
              disabled={loading}
              showCharCount={true}
            />
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
            placeholder="Describe detalladamente por qué reportas este comentario"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            name="description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            disabled={loading}
            showCharCount={true}
          />
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
            onClick={handleSubmit} 
            variant="primary" 
            disabled={loading || !validateForm()}
          >
            {loading ? "Procesando..." : "Aceptar"}
          </Button>
          <Button onClick={onCancel} variant="secondary" disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
