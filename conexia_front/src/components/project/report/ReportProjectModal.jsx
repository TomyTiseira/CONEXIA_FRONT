import { useState } from "react";
import Button from "@/components/ui/Button";

const REPORT_REASONS = [
  { value: "ofensivo", label: "Contenido ofensivo o inapropiado" },
  { value: "fraudulento", label: "Proyecto engañoso o fraudulento" },
  { value: "falso", label: "Información falsa" },
  { value: "otro", label: "Otro" },
];

export default function ReportProjectModal({ onCancel, onSubmit, loading }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const handleReasonChange = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };
  const handleSubmit = () => {
    setError("");
    if (selectedReasons.length === 0) {
      setError("Debes seleccionar al menos un motivo.");
      return;
    }
    const reason = selectedReasons[0];
    // Validación para 'Otro'
    if (reason === "Otro" && !otherText.trim()) {
      setError("Debes completar el campo 'Otro'.");
      return;
    }
    // No permitir enviar otherReason si el motivo no es 'Otro'
    if (reason !== "Otro" && otherText.trim()) {
      setError("No debes completar el campo 'Otro' si el motivo no es 'Otro'.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    onSubmit({
      reasons: [reason],
      other: reason === "Otro" ? otherText : undefined,
      description,
    });
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
          <div className="flex flex-col gap-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason.value)}
                  onChange={() => handleReasonChange(reason.value)}
                />
                <span>{reason.label}</span>
              </label>
            ))}
          </div>
          {selectedReasons.includes("otro") && (
            <input
              type="text"
              className="mt-2 w-full border rounded p-2 text-sm"
              placeholder="Completa el motivo..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              required
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            placeholder="Describe el motivo del reporte..."
          />
        </div>
        <div className="min-h-[40px] text-center text-sm transition-all duration-300 mb-2">
          {error && <p className="text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? "Procesando..." : "Aceptar"}
          </Button>
          <Button variant="danger" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
