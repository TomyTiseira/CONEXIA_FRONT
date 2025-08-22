import { useState } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/form/InputField";

const REPORT_REASONS = [
  { value: "Contenido ofensivo", label: "Contenido ofensivo o inapropiado" },
  { value: "Proyecto engañoso", label: "Proyecto engañoso o fraudulento" },
  { value: "Información falsa", label: "Información falsa" },
  { value: "Otro", label: "Otro" },
];

export default function ReportProjectModal({ onCancel, onSubmit, loading }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
    if (reason !== "Otro") {
      setOtherText("");
    }
  };
  const handleSubmit = () => {
    setError("");
    setMsg(null);
    if (!selectedReason) {
      setError("Debes seleccionar un motivo.");
      return;
    }
    // Validación para 'Otro'
    if (selectedReason === "Otro" && !otherText.trim()) {
      setError("Debes completar el campo 'Otro'.");
      return;
    }
    // No permitir enviar otherReason si el motivo no es 'Otro'
    if (selectedReason !== "Otro" && otherText.trim()) {
      setError("No debes completar el campo 'Otro' si el motivo no es 'Otro'.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    onSubmit({
      reason: selectedReason,
      other: selectedReason === "Otro" ? otherText : undefined,
      description,
    }, setMsg);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Reportar proyecto
        </h2>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">
            Motivos de reporte <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2 ml-6">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex items-center gap-2 cursor-pointer select-none text-base" style={{ opacity: 1 }}>
                <input
                  type="radio"
                  checked={selectedReason === reason.value}
                  onChange={() => handleReasonChange(reason.value)}
                  className="accent-gray-400 w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                  style={{ accentColor: '#6B7280', opacity: 1 }}
                />
                <span className="text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>
        {selectedReason === "Otro" && (
          <div className="mb-4 ml-6">
            <InputField
              type="text"
              placeholder="Completa el motivo..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              required
              name="otherReason"
              maxLength={100}
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <InputField
            multiline
            rows={3}
            placeholder="Describe el motivo del reporte..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            name="description"
            maxLength={500}
          />
        </div>
        <div className="min-h-[40px] text-center text-sm transition-all duration-300 mb-2">
          {error && <p className="text-red-600">{error}</p>}
          {msg && (
            <p className={msg.ok ? 'text-green-600' : 'text-red-600'}>{msg.text}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Procesando..." : "Aceptar"}
          </Button>
          <Button type="button" variant="cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
