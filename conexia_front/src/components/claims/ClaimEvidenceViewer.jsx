/**
 * ClaimEvidenceViewer Component
 * Componente para ver las evidencias de un reclamo
 * Muestra thumbnails de imágenes que abren modal con carrusel
 */

"use client";

import React, { useMemo, useState } from "react";
import { FileText, Image, Film, File, Download, Loader2 } from "lucide-react";
import { getFileType, getFileNameFromUrl } from "@/utils/claimValidation";
import { config } from "@/config/env";
import ImageZoomModalClaims from "./ImageZoomModalClaims";

/**
 * Convierte una ruta relativa en URL absoluta
 */
const getAbsoluteUrl = (url) => {
  if (!url) return "";

  // Si ya es una URL completa, devolverla tal cual
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si es una ruta relativa, construir URL completa
  // Remover el slash inicial si existe para evitar doble slash
  const path = url.startsWith("/") ? url.substring(1) : url;
  return `${config.DOCUMENT_URL}/${path}`;
};

/**
 * Obtiene el ícono según el tipo de archivo
 */
const getFileIcon = (url) => {
  const type = getFileType(url);
  const iconProps = { size: 20, className: "mr-2" };

  switch (type) {
    case "image":
      return <Image {...iconProps} className="text-blue-500" />;
    case "document":
      return <FileText {...iconProps} className="text-red-500" />;
    case "video":
      return <Film {...iconProps} className="text-purple-500" />;
    default:
      return <File {...iconProps} className="text-gray-500" />;
  }
};

export const ClaimEvidenceViewer = ({ evidenceUrls = [] }) => {
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [downloading, setDownloading] = useState(null); // índice del archivo que se está descargando

  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No se adjuntaron evidencias</p>
      </div>
    );
  }

  const handleImageClick = (imageIndex) => {
    setZoomIndex(imageIndex);
    setShowImageZoom(true);
  };

  const handleDownload = async (url, fileName, index) => {
    setDownloading(index);
    try {
      const absoluteUrl = getAbsoluteUrl(url);

      // Si es una URL de GCS, descargar directamente
      const isGCSUrl =
        absoluteUrl.startsWith("https://storage.googleapis.com") ||
        absoluteUrl.includes(".storage.googleapis.com");

      if (isGCSUrl) {
        // Descarga directa de GCS
        const link = document.createElement("a");
        link.href = absoluteUrl;
        link.download = fileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Desarrollo local - hacer fetch
        const response = await fetch(absoluteUrl);

        if (!response.ok) {
          throw new Error("Error al descargar el archivo");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error al descargar el archivo. Por favor, intenta nuevamente.");
    } finally {
      setDownloading(null);
    }
  };

  const grouped = useMemo(() => {
    const images = [];
    const pdfs = [];
    const videos = [];
    const others = [];

    (evidenceUrls || []).forEach((url) => {
      const type = getFileType(url);
      if (type === "image") {
        images.push(url);
      } else if (type === "document" && url.toLowerCase().endsWith(".pdf")) {
        pdfs.push(url);
      } else if (type === "video") {
        videos.push(url);
      } else {
        others.push(url);
      }
    });

    return { images, pdfs, videos, others };
  }, [evidenceUrls]);

  return (
    <>
      {grouped.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {grouped.images.map((url, index) => {
            const absoluteUrl = getAbsoluteUrl(url);
            const fileName = getFileNameFromUrl(url);

            return (
              <div
                key={`${url}-${index}`}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={absoluteUrl}
                  alt={fileName}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(url, fileName, `img-${index}`);
                    }}
                    disabled={downloading === `img-${index}`}
                    className="bg-black/60 hover:bg-black/75 text-white rounded-full p-2 disabled:opacity-50"
                    title="Descargar"
                  >
                    {downloading === `img-${index}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDFs con thumbnails */}
      {grouped.pdfs.length > 0 && (
        <div className={grouped.images.length > 0 ? "mt-4" : ""}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {grouped.pdfs.map((url, index) => {
              const absoluteUrl = getAbsoluteUrl(url);
              const fileName = getFileNameFromUrl(url);

              return (
                <div
                  key={`${url}-${index}`}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
                  onClick={() => window.open(absoluteUrl, "_blank")}
                >
                  <div className="w-full h-32 flex flex-col items-center justify-center bg-red-50">
                    <FileText size={48} className="text-red-500 mb-2" />
                    <span className="text-xs text-gray-600 px-2 text-center truncate max-w-full">
                      {fileName}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(url, fileName, `pdf-${index}`);
                      }}
                      disabled={downloading === `pdf-${index}`}
                      className="bg-black/60 hover:bg-black/75 text-white rounded-full p-2 disabled:opacity-50"
                      title="Descargar"
                    >
                      {downloading === `pdf-${index}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Videos con thumbnails */}
      {grouped.videos.length > 0 && (
        <div
          className={
            grouped.images.length > 0 || grouped.pdfs.length > 0 ? "mt-4" : ""
          }
        >
          <p className="text-sm font-medium text-gray-700 mb-2">Videos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {grouped.videos.map((url, index) => {
              const absoluteUrl = getAbsoluteUrl(url);
              const fileName = getFileNameFromUrl(url);

              return (
                <div
                  key={`${url}-${index}`}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
                  onClick={() => window.open(absoluteUrl, "_blank")}
                >
                  <div className="w-full h-32 flex flex-col items-center justify-center bg-purple-50">
                    <Film size={48} className="text-purple-500 mb-2" />
                    <span className="text-xs text-gray-600 px-2 text-center truncate max-w-full">
                      {fileName}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(url, fileName, `video-${index}`);
                      }}
                      disabled={downloading === `video-${index}`}
                      className="bg-black/60 hover:bg-black/75 text-white rounded-full p-2 disabled:opacity-50"
                      title="Descargar"
                    >
                      {downloading === `video-${index}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Otros archivos */}
      {grouped.others.length > 0 && (
        <div
          className={
            grouped.images.length > 0 ||
            grouped.pdfs.length > 0 ||
            grouped.videos.length > 0
              ? "mt-4 space-y-3"
              : "space-y-3"
          }
        >
          <p className="text-sm font-medium text-gray-700 mb-2">
            Otros archivos
          </p>
          {grouped.others.map((url, index) => {
            const fileName = getFileNameFromUrl(url);
            const fileType = getFileType(url);

            return (
              <div
                key={`${url}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {getFileIcon(url)}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <button
                    type="button"
                    onClick={() => window.open(getAbsoluteUrl(url), "_blank")}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Abrir archivo"
                  >
                    <File size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(url, fileName, `file-${index}`)
                    }
                    disabled={downloading === `file-${index}`}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar"
                  >
                    {downloading === `file-${index}` ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de zoom con carrusel */}
      <ImageZoomModalClaims
        open={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        images={grouped.images}
        initialIndex={zoomIndex}
      />
    </>
  );
};

export default ClaimEvidenceViewer;
