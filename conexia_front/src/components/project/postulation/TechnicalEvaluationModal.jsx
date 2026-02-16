"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Modal para mostrar y enviar evaluación técnica después de postularse
 */
export default function TechnicalEvaluationModal({
  isOpen,
  onClose,
  evaluation,
  roleTitle,
  onSubmit,
  onSkip,
  loading,
}) {
  const [evaluationFile, setEvaluationFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !evaluation) return null;

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no puede superar los 10MB");
      return;
    }

    setEvaluationFile(file);
    setError(null);
  };

  const handleSubmit = () => {
    if (!evaluationFile) {
      setError("Debes seleccionar un archivo con tu solución");
      return;
    }

    onSubmit(evaluationFile);
  };

  const handleSkip = () => {
    onSkip();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Evaluación Técnica
                </h2>
                <p className="text-sm text-gray-600">
                  Rol:{" "}
                  <span className="font-semibold text-conexia-green">
                    {roleTitle}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mensaje de éxito de postulación */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  ¡Postulación enviada con éxito!
                </h3>
                <p className="text-sm text-green-800">
                  Ahora puedes completar la evaluación técnica. Tienes{" "}
                  <span className="font-semibold">
                    {evaluation.days} día{evaluation.days !== 1 ? "s" : ""}
                  </span>{" "}
                  para enviarla.
                </p>
              </div>
            </div>
          </div>

          {/* Información de la evaluación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Clock size={18} />
              Descripción de la Evaluación
            </h3>
            <p className="text-blue-800 text-sm mb-4 whitespace-pre-wrap break-words">
              {evaluation.description}
            </p>

            {/* Link si existe */}
            {evaluation.link && (
              <div className="mb-3">
                <a
                  href={evaluation.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  🔗 Abrir enlace de la evaluación
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Archivo si existe */}
            {evaluation.fileUrl && (
              <div className="mb-3">
                <button
                  onClick={async () => {
                    const { openFileInNewTab } =
                      await import("@/utils/fileUtils");
                    openFileInNewTab(evaluation.fileUrl);
                  }}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  <Download size={16} />
                  Ver archivo de la evaluación
                  {evaluation.fileName && ` (${evaluation.fileName})`}
                </button>
              </div>
            )}

            {/* Tiempo límite */}
            <div className="flex items-center gap-2 text-sm text-blue-700 mt-4 pt-3 border-t border-blue-200">
              <Clock size={16} />
              <span className="font-medium">Tiempo límite:</span>
              <span className="font-semibold">
                {evaluation.days} día{evaluation.days !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Upload de solución */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Adjunta tu solución
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {evaluationFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={28} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {evaluationFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(evaluationFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluationFile(null);
                      setError(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-conexia-green font-semibold hover:underline text-sm"
                  >
                    Seleccionar archivo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Cualquier formato hasta 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle size={16} />
                <p className="text-xs">{error}</p>
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-yellow-600 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Puedes enviar la evaluación ahora o más tarde</li>
                  <li>
                    Si decides enviarla más tarde, podrás acceder desde tu
                    perfil
                  </li>
                  <li>Asegúrate de enviarla dentro del plazo establecido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleSkip}
            variant="secondary"
            disabled={loading}
            className="flex-1"
          >
            Enviar más tarde
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            disabled={loading || !evaluationFile}
            className="flex-1"
          >
            {loading ? "Enviando..." : "Enviar evaluación ahora"}
          </Button>
        </div>
      </div>
    </div>
  );
}
