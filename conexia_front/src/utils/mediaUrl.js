// Utilidad central para construir URLs de medios (imágenes / videos)
// Normaliza variaciones: fileUrl, mediaUrl, file_path, fileName
import { config } from "@/config";

// Construye una URL válida para un medio evitando duplicar /uploads
// Casos soportados:
//  - raw ya es URL absoluta (GCS, CDN, etc) -> se retorna sin modificar
//  - raw comienza con /uploads/...
//  - raw comienza con uploads/...
//  - raw comienza con /... (sin uploads)
//  - raw es solo un nombre/segmento
export function buildMediaUrl(raw) {
  if (!raw) return "";
  let mediaUrl = String(raw);

  // Si es una URL absoluta (GCS, S3, CDN, etc), retornarla sin modificar
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
    return mediaUrl;
  }

  // Si llegamos aquí, es una ruta relativa (desarrollo local)
  let base = config?.IMAGE_URL || "";
  base = base.replace(/\/$/, ""); // Remover slash final

  // Asegurar que la base termina en /uploads (backend local expone archivos ahí)
  if (!/\/uploads$/.test(base) && base) {
    base = base + "/uploads";
  }

  // Normalizar mediaUrl para evitar duplicados
  mediaUrl = mediaUrl.replace(/\/uploads\/uploads/g, "/uploads");

  // Quitar prefijo 'uploads/' si viene sin slash inicial
  if (mediaUrl.startsWith("uploads/")) {
    mediaUrl = mediaUrl.substring("uploads/".length);
  }

  // Si inicia con /uploads, quitarlo para evitar duplicación
  if (mediaUrl.startsWith("/uploads")) {
    mediaUrl = mediaUrl.replace("/uploads", "");
  }

  // Asegurar que mediaUrl empieza con '/'
  if (!mediaUrl.startsWith("/")) mediaUrl = "/" + mediaUrl;

  return base + mediaUrl;
}

// Extrae la URL efectiva desde un objeto de media con diferentes keys
export function extractMediaPath(mediaObj) {
  if (!mediaObj || typeof mediaObj !== "object") return "";
  return (
    mediaObj.fileUrl ||
    mediaObj.mediaUrl ||
    mediaObj.file_path ||
    mediaObj.file ||
    mediaObj.fileName ||
    ""
  );
}

// Helper completo: pasa objeto media y construye URL final
export function getMediaUrlFromObject(mediaObj) {
  return buildMediaUrl(extractMediaPath(mediaObj));
}
