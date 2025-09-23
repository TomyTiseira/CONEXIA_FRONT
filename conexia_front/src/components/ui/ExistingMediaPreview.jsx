"use client";

export default function ExistingMediaPreview({ media, removedIds, onToggleRemove }) {
  if (!media || media.length === 0) return null;

  // Función para construir URL de medios (similar a getMediaUrl)
  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
    
    // Si la URL del backend viene con /uploads, construir URL completa
    if (mediaUrl.startsWith('/uploads')) {
      const pathWithoutUploads = mediaUrl.replace('/uploads', '');
      return `http://localhost:8080/uploads${pathWithoutUploads}`;
    }
    
    if (mediaUrl.startsWith('/')) return `http://localhost:8080/uploads${mediaUrl}`;
    return `http://localhost:8080/uploads/${mediaUrl}`;
  };

  return (
    <div className="existing-media-preview">
      {media.map((mediaItem, index) => {
        const isRemoved = removedIds.includes(mediaItem.id);
        const mediaUrl = getMediaUrl(mediaItem.fileUrl);
        
        return (
          <div key={mediaItem.id} className={`existing-media-item ${isRemoved ? 'removed' : ''}`}>
            {mediaItem.fileType?.startsWith('image/') ? (
              <img 
                src={mediaUrl}
                alt={mediaItem.filename}
                className="preview-media"
              />
            ) : mediaItem.fileType?.startsWith('video/') ? (
              <video 
                src={mediaUrl}
                className="preview-media"
                muted
              />
            ) : (
              <div className="preview-placeholder">
                <span>Media</span>
              </div>
            )}
            
            <button
              onClick={() => onToggleRemove(mediaItem.id)}
              className={`toggle-btn ${isRemoved ? 'restore-btn' : 'remove-btn'}`}
              type="button"
              title={isRemoved ? "Restaurar archivo" : "Marcar para eliminar"}
            >
              {isRemoved ? '↻' : '✕'}
            </button>
            
            <span className="order-indicator">{index + 1}</span>
          </div>
        );
      })}

      <style jsx>{`
        .existing-media-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
          margin-top: 8px;
          padding: 0 4px;
          max-width: 100%;
          overflow: hidden;
        }

        .existing-media-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid #e0f0f0;
          background: #f8fcfc;
          max-width: 100px;
          max-height: 100px;
          transition: all 0.2s ease;
        }

        .existing-media-item.removed {
          opacity: 0.5;
          border-color: #ef4444;
          background: #fef2f2;
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

        .toggle-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          border: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-btn {
          background: rgba(255, 0, 0, 0.8);
          color: white;
        }

        .remove-btn:hover {
          background: rgba(255, 0, 0, 1);
        }

        .restore-btn {
          background: rgba(34, 197, 94, 0.8);
          color: white;
        }

        .restore-btn:hover {
          background: rgba(34, 197, 94, 1);
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