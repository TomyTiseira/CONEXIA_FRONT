import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ReviewEditModal({ 
  open, 
  onClose, 
  onConfirm, 
  review, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (review && open) {
      setFormData({
        comment: review.comment || ''
      });
      setErrors({});
      setTouched({});
    }
  }, [review, open]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors = {};

    // Validar comentario
    if (!formData.comment || formData.comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    } else if (formData.comment.length > 1000) {
      newErrors.comment = 'El comentario no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setTouched({ comment: true });
    if (validateForm()) {
      const updatedData = {
        comment: formData.comment.trim()
      };
      
      onConfirm(updatedData);
    }
  };

  const handleClose = () => {
    setFormData({ comment: '' });
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleInputChange = (value) => {
    setFormData(prev => ({ ...prev, comment: value }));
    
    // Validar en tiempo real después del primer toque
    if (touched.comment) {
      setTimeout(() => {
        const newErrors = { ...errors };
        
        if (!value || value.trim().length < 10) {
          newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
        } else if (value.length > 1000) {
          newErrors.comment = 'El comentario no puede exceder 1000 caracteres';
        } else {
          delete newErrors.comment;
        }
        
        setErrors(newErrors);
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-md mx-4 animate-fadeIn flex flex-col p-6">
        <h2 className="text-lg font-semibold text-conexia-green mb-2">Editar Reseña</h2>
        <p className="text-sm text-gray-700 mb-4">
          Actualiza tu comentario. <span className="text-xs text-gray-500">(La calificación no se puede modificar)</span>
        </p>
        
        {/* Mostrar calificación actual (solo lectura) */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación actual
          </label>
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={
                  star <= review?.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {review?.rating}.0
            </span>
          </div>
        </div>

        {/* Comentario editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border rounded-lg p-2 text-sm h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-conexia-green/30 ${
              touched.comment && errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Comparte tu experiencia con este servicio..."
            value={formData.comment}
            onChange={e => handleInputChange(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, comment: true }))}
            disabled={loading}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {touched.comment && errors.comment && (
                <span className="text-xs text-red-600">{errors.comment}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formData.comment.length}/500
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="cancel" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
