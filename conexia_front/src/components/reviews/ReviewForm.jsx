'use client';
import React, { useState, useEffect } from 'react';
import { createReview, editReview } from '@/service/reviews/reviewsFetch';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import InputField from '@/components/form/InputField';

export default function ReviewForm({ initial = null, reviewedUserId, onClose, onSaved }) {
  const [relationship, setRelationship] = useState(initial?.relationship || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setRelationship(initial?.relationship || '');
    setDescription(initial?.description || '');
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!relationship || relationship.trim() === '') e.relationship = 'Indica la relación (máx 30 caracteres)';
    if (relationship && relationship.length > 30) e.relationship = 'Máx 30 caracteres';
    if (!description || description.trim() === '') e.description = 'Ingresa la reseña';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (initial?.id) {
        await editReview(initial.id, { relationship: relationship.trim(), description: description.trim() });
      } else {
        await createReview({ reviewedUserId, relationship: relationship.trim(), description: description.trim() });
      }
      onSaved();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-hidden flex flex-col" style={{ borderRadius: '1rem' }}>
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-center text-conexia-green">
            {initial ? 'Editar reseña' : 'Agregar reseña'}
          </h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-conexia-green font-semibold mb-2">
                Relación <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">Indique la relación laboral que tuvieron</p>
              <InputField
                type="text"
                placeholder="Máximo 30 caracteres"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                name="relationship"
                maxLength={30}
                showCharCount={true}
                error={errors.relationship}
              />
            </div>
            <div>
              <label className="block text-conexia-green font-semibold mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <InputField
                multiline
                rows={4}
                placeholder="Describe tu experiencia trabajando con esta persona..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="description"
                maxLength={500}
                showCharCount={true}
                error={errors.description}
              />
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-2">
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Aceptar'}
          </Button>
          <Button
            type="button"
            variant="cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} position="top-center" />}
      </div>
    </div>
  );
}
