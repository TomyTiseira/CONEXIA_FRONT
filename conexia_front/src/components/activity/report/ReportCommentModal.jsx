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
  const MAX_OTHER_REASON_LENGTH = 200;

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

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
      setError("");
    }
  };

  const handleOtherTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_OTHER_REASON_LENGTH) {
      setOtherText(value);
      setError("");
    }
  };

  const validateForm = () => {
    if (!selectedReason) {
      setError("Debes seleccionar un motivo.");
      return false;
    }
    
    if (selectedReason === "Otro" && !otherText.trim()) {
      setError("Debes especificar el motivo del reporte.");
      return false;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return false;
    }

    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setError(`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres.`);
      return false;
    }

    return true;
  };

  const isFormValid = () => {
    return (
      selectedReason &&
      description.trim().length >= MIN_DESCRIPTION_LENGTH &&
      description.trim().length <= MAX_DESCRIPTION_LENGTH &&
      (selectedReason !== "Otro" || (otherText.trim() && otherText.length <= MAX_OTHER_REASON_LENGTH))
    );
  };

  const handleSubmit = () => {
    setError("");
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      reason: selectedReason,
      otherReason: selectedReason === "Otro" ? otherText : undefined,
      description,
    });
  };

  const getInputBorderColor = (value, isValid) => {
    if (!value) return "border-gray-300";
    return isValid ? "border-green-500" : "border-red-500";
  };

  const isDescriptionValid = description.trim().length >= MIN_DESCRIPTION_LENGTH && description.trim().length <= MAX_DESCRIPTION_LENGTH;
  const isOtherReasonValid = selectedReason !== "Otro" || (otherText.trim() && otherText.length <= MAX_OTHER_REASON_LENGTH);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: '1rem' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-conexia-green">
            Reportar Comentario
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

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

        {/* Campo 1: Motivo del Reporte */}
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-2 text-sm">
            Motivo <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => handleReasonChange(e.target.value)}
            className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-conexia-green/50 ${
              !selectedReason ? "border-gray-300 text-gray-500" : "border-gray-300 text-gray-900"
            }`}
            disabled={loading}
          >
            <option value="">Selecciona un motivo</option>
            {REPORT_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo 2: Otro Motivo (Condicional) */}
        {selectedReason === "Otro" && (
          <div className="mb-4">
            <label className="block text-conexia-green font-semibold mb-2 text-sm">
              Especifica el motivo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={otherText}
              onChange={handleOtherTextChange}
              placeholder="Describe el motivo del reporte"
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-conexia-green/50 ${
                getInputBorderColor(otherText, isOtherReasonValid)
              }`}
              disabled={loading}
              maxLength={MAX_OTHER_REASON_LENGTH}
            />
            <div className="flex justify-between items-center mt-1">
              {otherText && !isOtherReasonValid && (
                <span className="text-red-500 text-xs">Este campo es requerido</span>
              )}
              <span className="text-gray-500 text-xs ml-auto">
                {otherText.length}/{MAX_OTHER_REASON_LENGTH}
              </span>
            </div>
          </div>
        )}

        {/* Campo 3: Descripción */}
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-2 text-sm">
            Descripción del reporte <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border rounded-lg p-2.5 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-conexia-green/50 ${
              getInputBorderColor(description, isDescriptionValid)
            }`}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe detalladamente por qué reportas este comentario"
            disabled={loading}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <div className="flex justify-between items-center mt-1">
            {description && !isDescriptionValid && (
              <span className="text-red-500 text-xs">
                {description.trim().length < MIN_DESCRIPTION_LENGTH
                  ? `Mínimo ${MIN_DESCRIPTION_LENGTH} caracteres`
                  : ""}
              </span>
            )}
            <span className={`text-xs ml-auto ${
              charCount >= MAX_DESCRIPTION_LENGTH ? "text-red-500" : "text-gray-500"
            }`}>
              {charCount}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} variant="secondary" disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="primary" 
            disabled={loading || !isFormValid()}
          >
            {loading ? "Procesando..." : "Aceptar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
