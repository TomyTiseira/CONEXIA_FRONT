
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
  
  // Usamos un único mensaje de error centrado (como se pidió)
  const reasonError = error.toLowerCase().includes("motivo");
  const otherError = error.toLowerCase().includes("'otro'");
  const descriptionError = error.toLowerCase().includes("descripción");
  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
    if (reason !== "Otro") {
      setOtherText("");
    }
  };
  const handleSubmit = () => {
    setError("");
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
    });
  };
  const handleCancel = () => {
    // Resetear estado al cancelar
    setSelectedReason("");
    setOtherText("");
    setDescription("");
    setError("");
    onCancel();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">Reportar proyecto</h2>
        </div>
        {/* Contenido scrollable completo */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="flex items-start gap-2 bg-conexia-coral/10 border border-conexia-coral rounded-lg px-3 py-2 mb-4">
            <MdErrorOutline size={28} className="text-conexia-coral flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-conexia-coral text-xs">
              <div className="font-semibold">¿Por qué reportar este proyecto?</div>
              <div className="mt-0.5 leading-tight">
                Al reportar un proyecto, ayudas a mantener la comunidad segura y confiable. El reporte será revisado por nuestro equipo y, si corresponde, se tomarán las medidas necesarias. El dueño del proyecto no sabrá quién realizó el reporte.
                <br />
                <span className="text-xs font-semibold">Importante: Si realizas reportes falsos de manera reiterada, tu cuenta podrá ser suspendida o dada de baja.</span>
              </div>
            </div>
          </div>
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
          {selectedReason === "Otro" && (
            <div className="mt-2 mb-2 ml-6">
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
              {/* Error específico removido; usaremos un único mensaje centrado más abajo */}
            </div>
          )}
        <div className="mt-3 mb-2">
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
          {/* Error específico removido; usaremos un único mensaje centrado */}
        </div>
        {/* Mensaje de error único y centrado con poco espacio debajo de la descripción */}
        {error && (
          <div className="flex justify-center">
            <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
          </div>
        )}
        </div>
        <div className="sticky bottom-0 z-10 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-2">
          <Button type="button" variant="cancel" onClick={handleCancel} disabled={loading}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading}>{loading ? "Procesando..." : "Aceptar"}</Button>
        </div>
      </div>
    </div>
  );
}
