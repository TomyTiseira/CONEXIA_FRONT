'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function FaceCapture({ onFileSelect, selectedFile }) {
  const [mode, setMode] = useState(null); // 'camera' | 'upload' | null
  const [stream, setStream] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten imágenes en formato JPEG o PNG.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen excede los 10MB. Por favor, selecciona una imagen más pequeña.';
    }

    return null;
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Por favor, verifica los permisos o sube una foto.'
      );
      setMode(null);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          onFileSelect(file);
          stopCamera();
          setMode(null);
        };
        reader.readAsDataURL(file);
      }
    }, 'image/jpeg', 0.9);
  }, [onFileSelect, stopCamera]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      onFileSelect(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError(null);
      onFileSelect(file);
      setMode(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    stopCamera();
    setMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetake = () => {
    setPreview(null);
    onFileSelect(null);
    startCamera();
  };

  // Conectar el stream al video cuando esté disponible
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="border-2 border-green-500 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview de selfie"
              className="w-full h-64 object-contain bg-gray-50"
            />
          </div>
          
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            aria-label="Eliminar foto"
          >
            <X size={20} />
          </button>

          <div className="flex items-center space-x-2 mt-3 text-sm text-green-600">
            <CheckCircle size={16} />
            <span className="font-medium">Foto capturada correctamente</span>
          </div>
        </div>

        <button
          onClick={handleRetake}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <RefreshCw size={18} />
          <span>Tomar otra foto</span>
        </button>
      </div>
    );
  }

  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={capturePhoto}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Camera size={20} />
            <span>Capturar Foto</span>
          </button>
          
          <button
            onClick={() => {
              stopCamera();
              setMode(null);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Asegúrate de que tu rostro esté bien iluminado y centrado en el encuadre.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={startCamera}
          className="border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50 rounded-lg p-6 text-center transition-all"
        >
          <Camera className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="font-medium text-gray-700">Usar Cámara</p>
          <p className="text-sm text-gray-500 mt-1">Tomar una selfie ahora</p>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50 rounded-lg p-6 text-center transition-all"
        >
          <Upload className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="font-medium text-gray-700">Subir Archivo</p>
          <p className="text-sm text-gray-500 mt-1">Seleccionar una foto</p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {(error || cameraError) && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-700">{error || cameraError}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-800">Requisitos de la foto:</p>
        <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
          <li>Tu rostro debe estar claramente visible</li>
          <li>Evita usar gafas de sol, gorras o máscaras</li>
          <li>Asegúrate de tener buena iluminación</li>
          <li>Mira directamente a la cámara</li>
        </ul>
      </div>
    </div>
  );
}
