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
    if (selectedReason === "Otro" && !otherText.trim()) {
      setError("Debes completar el campo 'Otro'.");
      return;
    }
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: '1rem' }}
      >
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Reportar publicación
        </h2>
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
          <label className="block text-conexia-green font-semibold mb-1">
            Motivos de reporte <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2 ml-6">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex items-center gap-2 cursor-pointer select-none text-base" style={{ opacity: 1 }}>
                <input
                  type="radio"
                  name="reportReason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={() => handleReasonChange(reason.value)}
                  className="accent-conexia-coral"
                />
                {reason.label}
              </label>
            ))}
          </div>
          {selectedReason === "Otro" && (
            <InputField
              label="Otro motivo"
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              required
              className="mt-2"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-conexia-green font-semibold mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-lg p-2 min-h-[60px] resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe el motivo del reporte..."
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {msg && (
          <div className={`text-sm mb-2 ${
            typeof msg === 'object' 
              ? (msg.ok ? 'text-green-600' : 'text-red-600')
              : 'text-conexia-green'
          }`}>
            {typeof msg === 'object' ? msg.text : msg}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} variant="secondary" disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="primary" disabled={loading}>
            {loading ? "Procesando..." : "Aceptar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
