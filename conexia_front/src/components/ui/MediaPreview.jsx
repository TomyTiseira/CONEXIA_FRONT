"use client";
import { useState } from 'react';

export default function MediaPreview({ files, onRemove, maxFiles = 5, onSelect }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="media-preview-grid">
      {files.map((file, index) => (
        <div key={index} className="media-preview-item" onClick={() => onSelect && onSelect(index)}>
          {file.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${index + 1}`}
              className="preview-media clickable"
            />
          ) : file.type.startsWith('video/') ? (
            <video
              src={URL.createObjectURL(file)}
              className="preview-media clickable"
              muted
            />
          ) : (
            <div className="preview-placeholder clickable">
              <span>Archivo</span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="remove-btn"
            type="button"
            title="Eliminar archivo"
          >
            ✕
          </button>
          <span className="order-indicator">{index + 1}</span>
        </div>
      ))}

      <style jsx>{`
        .media-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 8px;
          padding: 0 4px 4px 4px;
          max-width: 100%;
        }

        .media-preview-item {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #e0f0f0;
          background: #f8fcfc;
          width: 100%;
          height: 180px; /* Larger preview height */
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .media-preview-item:hover { transform: scale(1.01); }

        .preview-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e1e5e9;
          color: #6b7280;
          font-size: 12px;
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(255, 0, 0, 0.9);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .remove-btn:hover {
          background: rgba(255, 0, 0, 1);
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }

        .order-indicator {
          position: absolute;
          bottom: 2px;
          left: 2px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 1px 4px;
          border-radius: 8px;
          font-size: 8px;
        }

        @media (max-width: 640px) {
          .media-preview-item { height: 150px; }
        }
      `}</style>
    </div>
  );
}