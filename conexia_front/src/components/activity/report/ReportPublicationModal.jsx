import { useState } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/form/InputField";
import { MdErrorOutline } from "react-icons/md";

const REPORT_REASONS = [
  { value: "Contenido ofensivo o inapropiado", label: "Contenido ofensivo o inapropiado" },
  { value: "Proyecto engañoso o fraudulento", label: "Proyecto engañoso o fraudulento" },
  { value: "Información falsa", label: "Información falsa" },
  { value: "Otro", label: "Otro" },
];

export default function ReportPublicationModal({ onCancel, onSubmit, loading }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
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
    
    if (!description || description.trim().length < 10) {
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
    if (description.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }
    // Delegamos totalmente el feedback al padre (toast + cierre)
    onSubmit({
      reason: selectedReason,
      other: selectedReason === "Otro" ? otherText : undefined,
      description,
    });
  };
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">Reportar publicación</h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-auto px-6 py-4">
        <div className="flex items-center gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
          <MdErrorOutline size={28} className="text-conexia-coral flex-shrink-0" />
          <div className="flex-1">
            <div className="text-conexia-coral font-semibold text-xs">¿Por qué reportar esta publicación?</div>
            <div className="text-conexia-coral text-xs mt-0.5 leading-tight">
              Al reportar una publicación, ayudas a mantener la comunidad segura y confiable. El reporte será revisado por nuestro equipo y, si corresponde, se tomarán las medidas necesarias. El dueño de la publicación no sabrá quién realizó el reporte.
              <br />
              <span className="text-xs text-conexia-coral font-semibold">Importante: Si realizas reportes falsos de manera reiterada, tu cuenta podrá ser suspendida o dada de baja.</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-2">
            Motivos de reporte <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2 ml-6">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex items-center gap-2 cursor-pointer select-none text-base">
                <input
                  type="radio"
                  name="reportReason"
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
                if (e.target.value.length <= 30) setOtherText(e.target.value);
              }}
              name="otherReason"
              maxLength={30}
              disabled={loading}
              showCharCount={true}
            />
          </div>
        )}

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
          <Button onClick={onCancel} variant="cancel" disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
