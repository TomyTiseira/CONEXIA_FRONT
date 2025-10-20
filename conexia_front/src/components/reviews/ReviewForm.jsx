'use client';
import React, { useState, useEffect } from 'react';
import { createReview, editReview } from '@/service/reviews/reviewsFetch';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function ReviewForm({ initial = null, reviewedUserId, onClose, onSaved }) {
  const [relation, setRelation] = useState(initial?.relation || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setRelation(initial?.relation || '');
    setDescription(initial?.description || '');
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!relation || relation.trim() === '') e.relation = 'Indica la relación (máx 30 caracteres)';
    if (relation && relation.length > 30) e.relation = 'Máx 30 caracteres';
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
        await editReview(initial.id, { relation: relation.trim(), description: description.trim() });
      } else {
        await createReview({ reviewedUserId, relation: relation.trim(), description: description.trim() });
      }
      onSaved();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Editar reseña' : 'Agregar reseña'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Relación <span className="text-sm text-gray-500">(Indique la relación laboral que tuvieron)</span></label>
            <input value={relation} onChange={e => setRelation(e.target.value)} maxLength={30} className="w-full border rounded px-3 py-2" />
            {errors.relation && <p className="text-red-500 text-sm mt-1">{errors.relation}</p>}
          </div>
          <div>
            <label className="block font-medium">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border rounded px-3 py-2" />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Procesando...' : 'Aceptar'}</Button>
          </div>
        </form>

        {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
