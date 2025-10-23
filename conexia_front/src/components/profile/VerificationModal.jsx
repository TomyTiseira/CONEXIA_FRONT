'use client';

import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import FaceCapture from './FaceCapture';
import { verifyIdentity } from '@/service';

const STEPS = {
  INSTRUCTIONS: 0,
  DOCUMENT_TYPE: 1,
  DOCUMENT_UPLOAD: 2,
  FACE_CAPTURE: 3,
  CONFIRMATION: 4,
};

export default function VerificationModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(STEPS.INSTRUCTIONS);
  const [documentType, setDocumentType] = useState('DNI');
  const [documentFile, setDocumentFile] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.INSTRUCTIONS) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.INSTRUCTIONS:
        return true;
      case STEPS.DOCUMENT_TYPE:
        return documentType !== null;
      case STEPS.DOCUMENT_UPLOAD:
        return documentFile !== null;
      case STEPS.FACE_CAPTURE:
        return faceFile !== null;
      case STEPS.CONFIRMATION:
        return documentFile !== null && faceFile !== null;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!documentFile || !faceFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await verifyIdentity(documentFile, faceFile, documentType);
      setResult(response.data);
      // Esperar un momento antes de cerrar para que el usuario vea el éxito
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al verificar identidad');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.INSTRUCTIONS:
        return 'Instrucciones';
      case STEPS.DOCUMENT_TYPE:
        return 'Tipo de Documento';
      case STEPS.DOCUMENT_UPLOAD:
        return 'Documento de Identidad';
      case STEPS.FACE_CAPTURE:
        return 'Foto de Rostro';
      case STEPS.CONFIRMATION:
        return 'Confirmación';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.INSTRUCTIONS:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">
                Para verificar tu identidad necesitarás:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">Una foto clara de tu DNI o Pasaporte</p>
                    <p className="text-sm text-blue-700">El documento debe mostrar tu número de identificación</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">Una foto actual de tu rostro (selfie)</p>
                    <p className="text-sm text-blue-700">Tu rostro debe estar visible sin accesorios que lo oculten</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h4 className="font-semibold text-gray-900">Requisitos:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Las imágenes deben ser claras y legibles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Formato: JPEG o PNG</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Tamaño máximo: 10MB por imagen</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>El documento debe mostrar tu número de identificación</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Tu rostro debe estar visible sin accesorios que lo oculten</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Tus imágenes serán procesadas de forma segura y solo se
                utilizarán para verificar tu identidad. No se almacenarán permanentemente.
              </p>
            </div>
          </div>
        );

      case STEPS.DOCUMENT_TYPE:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Selecciona el tipo de documento que vas a utilizar:</p>
            
            <div className="space-y-3">
              <label
                className={`
                  flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${documentType === 'DNI'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="documentType"
                  value="DNI"
                  checked={documentType === 'DNI'}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="font-medium text-gray-900">DNI (Documento Nacional de Identidad)</p>
                  <p className="text-sm text-gray-600">Documento de identidad nacional</p>
                </div>
              </label>

              <label
                className={`
                  flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${documentType === 'Pasaporte'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="documentType"
                  value="Pasaporte"
                  checked={documentType === 'Pasaporte'}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Pasaporte</p>
                  <p className="text-sm text-gray-600">Pasaporte internacional</p>
                </div>
              </label>
            </div>
          </div>
        );

      case STEPS.DOCUMENT_UPLOAD:
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Sube una foto clara de tu {documentType === 'DNI' ? 'DNI' : 'Pasaporte'}
            </p>
            <DocumentUpload
              onFileSelect={setDocumentFile}
              selectedFile={documentFile}
            />
          </div>
        );

      case STEPS.FACE_CAPTURE:
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Toma una selfie o sube una foto reciente de tu rostro
            </p>
            <FaceCapture
              onFileSelect={setFaceFile}
              selectedFile={faceFile}
            />
          </div>
        );

      case STEPS.CONFIRMATION:
        if (result) {
          return (
            <div className="space-y-6 text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  ¡Identidad Verificada Exitosamente!
                </h3>
                <p className="text-gray-600">
                  Tu identidad ha sido verificada correctamente.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                <p className="font-semibold text-green-900">Ahora puedes:</p>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center justify-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Crear y publicar proyectos</span>
                  </li>
                  <li className="flex items-center justify-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Postularte a proyectos</span>
                  </li>
                  <li className="flex items-center justify-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Crear servicios</span>
                  </li>
                  <li className="flex items-center justify-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Solicitar cotizaciones</span>
                  </li>
                </ul>
              </div>

              {result.similarity_score && (
                <p className="text-sm text-gray-600">
                  Similitud facial: <strong>{result.similarity_score.toFixed(1)}%</strong>
                </p>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Revisa la información antes de enviar:
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tipo de documento:</p>
                <p className="text-lg font-semibold text-gray-900">{documentType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Documento:</p>
                  {documentFile && (
                    <img
                      src={URL.createObjectURL(documentFile)}
                      alt="Preview documento"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selfie:</p>
                  {faceFile && (
                    <img
                      src={URL.createObjectURL(faceFile)}
                      alt="Preview selfie"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error en la verificación</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Al hacer clic en "Verificar Identidad", aceptas que procesemos tus imágenes
                para verificar tu identidad de forma segura.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="text-blue-600" size={28} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verificación de Identidad</h2>
              <p className="text-sm text-gray-600">{getStepTitle()}</p>
            </div>
          </div>
          {!isSubmitting && !result && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!result && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Paso {currentStep + 1} de {Object.keys(STEPS).length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / Object.keys(STEPS).length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / Object.keys(STEPS).length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === STEPS.INSTRUCTIONS || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Anterior</span>
            </button>

            {currentStep === STEPS.CONFIRMATION ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>Verificar Identidad</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Siguiente</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
