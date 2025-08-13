'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export default function Toast({ 
  type = 'info', 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'bottom-right' 
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(onClose, 300); // Esperar animación
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div
      className={`fixed ${getPositionClasses()} ${getColors()} p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 transition-all duration-300 max-w-sm ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setShow(false);
          setTimeout(onClose, 300);
        }}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
