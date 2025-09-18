'use client';
import AttachmentPreview from './AttachmentPreview';

export default function AttachmentPreviewFullWidth({ attachment, error, onCancel }) {
  if (!attachment && !error) return null;

  // Error full-width
  if (error) {
    return (
      <div className="w-full rounded-lg shadow border border-red-300 bg-red-50 pl-3 pr-2 py-2 flex items-center gap-3">
        <div className="text-sm text-red-700 truncate">{error}</div>
        <button onClick={onCancel} className="ml-auto text-red-600/80 hover:text-red-700" aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Full-width bar
  const { type, url, name, size } = attachment || {};
  const isImage = type === 'image';

  return (
    <div className="w-full rounded-lg shadow border border-conexia-green/30 bg-white px-3 py-2 flex items-center gap-3">
      <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-gray-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/images/image-pdf.png" alt="PDF" className="w-9 h-9 object-contain" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[13px] font-medium text-gray-700" title={name || (isImage ? 'Imagen' : 'Documento')}>
          {name || (isImage ? 'Imagen' : 'Documento')}
        </div>
        {typeof size === 'number' && (
          <div className="text-[11px] text-gray-500">{(size / (1024 * 1024)).toFixed(2)} MB</div>
        )}
      </div>
      <button
        onClick={onCancel}
        className="ml-2 text-gray-500 hover:text-gray-700 p-1"
        aria-label="Quitar adjunto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

