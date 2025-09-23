"use client";
import { useState } from 'react';

export default function MediaPreview({ files, onRemove, maxFiles = 5 }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="media-preview-grid">
      {files.map((file, index) => (
        <div key={index} className="media-preview-item">
          {file.type.startsWith('image/') ? (
            <img 
              src={URL.createObjectURL(file)}
              alt={`Preview ${index + 1}`}
              className="preview-media"
            />
          ) : file.type.startsWith('video/') ? (
            <video 
              src={URL.createObjectURL(file)}
              className="preview-media"
              muted
            />
          ) : (
            <div className="preview-placeholder">
              <span>Archivo</span>
            </div>
          )}
          <button
            onClick={() => onRemove(index)}
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
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
          margin-top: 8px;
          padding: 0 4px;
          max-width: 100%;
          overflow: hidden;
        }

        .media-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid #e0f0f0;
          background: #f8fcfc;
          max-width: 100px;
          max-height: 100px;
        }

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
          top: 2px;
          right: 2px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .remove-btn:hover {
          background: rgba(255, 0, 0, 1);
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
      `}</style>
    </div>
  );
}