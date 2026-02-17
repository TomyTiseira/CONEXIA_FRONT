import { config } from "@/config";

/**
 * Genera la URL completa de un archivo
 * Si la URL ya es absoluta (http/https), la devuelve tal cual
 * Si es relativa, le agrega el DOCUMENT_URL
 *
 * @param {string} fileUrl - URL del archivo (puede ser relativa o absoluta)
 * @returns {string} URL completa del archivo
 */
export const getFullFileUrl = (fileUrl) => {
  if (!fileUrl) return "";

  // Si la URL ya es absoluta (empieza con http:// o https://), devolverla tal cual
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  // Si es relativa, agregar el DOCUMENT_URL
  return `${config.DOCUMENT_URL}${fileUrl}`;
};

/**
 * Abre un archivo en una nueva pestaña
 * @param {string} fileUrl - URL del archivo
 */
export const openFileInNewTab = (fileUrl) => {
  const fullUrl = getFullFileUrl(fileUrl);
  if (fullUrl) {
    window.open(fullUrl, "_blank");
  }
};

/**
 * Descarga un archivo
 * @param {string} fileUrl - URL del archivo
 * @param {string} fileName - Nombre sugerido para el archivo (opcional)
 */
export const downloadFile = (fileUrl, fileName) => {
  const fullUrl = getFullFileUrl(fileUrl);
  if (!fullUrl) return;

  const link = document.createElement("a");
  link.href = fullUrl;
  if (fileName) {
    link.download = fileName;
  }
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
