
import { useState } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/form/InputField";
import { MdErrorOutline } from "react-icons/md";

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: '1rem' }}
      >
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Reportar proyecto
        </h2>
        <div className="flex items-center gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
          <MdErrorOutline size={28} className="text-conexia-coral flex-shrink-0" />
          <div className="flex-1">
            <div className="text-conexia-coral font-semibold text-xs">¿Por qué reportar este proyecto?</div>
            <div className="text-conexia-coral text-xs mt-0.5 leading-tight">
              Al reportar un proyecto, ayudas a mantener la comunidad segura y confiable. El reporte será revisado por nuestro equipo y, si corresponde, se tomarán las medidas necesarias. El dueño del proyecto no sabrá quién realizó el reporte.
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
                  checked={selectedReason === reason.value}
                  onChange={() => handleReasonChange(reason.value)}
                  className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-conexia-green/40"
                  style={{ accentColor: '#145750', opacity: 1 }}
                />
                <span className="text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>
        {selectedReason === "Otro" && (
          <div className="mb-2 ml-6">
            <InputField
              type="text"
              placeholder="Completa el motivo... (máx. 30 caracteres)"
              value={otherText}
              onChange={(e) => {
                if (e.target.value.length <= 30) setOtherText(e.target.value);
              }}
              required
              name="otherReason"
              maxLength={30}
            />
          </div>
        )}
        <div className="mb-2">
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
  <div className="min-h-[24px] text-center text-sm transition-all duration-300 mb-1">
          {error && <p className="text-red-600">{error}</p>}
          {msg && (
            <p className={msg.ok ? 'text-green-600' : 'text-red-600'}>{msg.text}</p>
          )}
        </div>
        <style jsx>{`
          div[class*='max-h-[95vh]']::-webkit-scrollbar {
            display: none;
          }
        `}</style>
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
