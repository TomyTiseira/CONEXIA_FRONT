'use client';
import React, { useState } from 'react';
import { deleteReview } from '@/service/reviews/reviewsFetch';
import Button from '@/components/ui/Button';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export default function ReviewItem({ review, onEdit, onDeleted }) {
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const isOwner = user?.id === review.reporterId;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteReview(review.id);
      setToast({ type: 'success', message: 'Reseña eliminada' });
      onDeleted();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-gray-600">Relación: {review.relation}</div>
          <div className="mt-2 text-gray-800">{review.description}</div>
          <div className="text-xs text-gray-500 mt-2">Por: {review.reporter?.email || review.reporterId} · {new Date(review.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex flex-col gap-2">
          {isOwner && <button className="text-blue-600" onClick={onEdit}>Editar</button>}
          {isOwner && <button className="text-red-600" onClick={() => setConfirmOpen(true)}>Eliminar</button>}
        </div>
      </div>

      {confirmOpen && (
        <ConfirmDeleteModal
          title="Eliminar reseña"
          description="¿Seguro que deseas eliminar esta reseña?"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} isVisible onClose={() => setToast(null)} />}
    </div>
  );
}
