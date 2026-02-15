// Utilidad central para construir URLs de medios (imágenes / videos)
// Normaliza variaciones: fileUrl, mediaUrl, file_path, fileName
import { config } from "@/config";

// Construye una URL válida para un medio
// Producción: Backend devuelve URLs completas de GCS → se usan tal cual
// Desarrollo: Backend devuelve paths relativos → se construyen con IMAGE_URL
export function buildMediaUrl(raw) {
  if (!raw) return "";
  let mediaUrl = String(raw).trim();

  // Limpiar barras iniciales erróneas antes de URLs absolutas (ej: "/https://...")
  if (mediaUrl.match(/^\/+https?:\/\//)) {
    mediaUrl = mediaUrl.replace(/^\/+/, "");
  }

  // Si es URL absoluta (producción - GCS), retornarla sin modificar
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
    return mediaUrl;
  }

  // Desarrollo local: construir con IMAGE_URL
  let base = (config?.IMAGE_URL || "").trim();

  // Limpiar posibles comillas literales de variables de entorno mal configuradas
  base = base.replace(/^["']+|["']+$/g, "");

  if (!base || base === "") return mediaUrl; // Fallback si no hay base configurada

  base = base.replace(/\/$/, ""); // Remover slash final

  // Asegurar que la base termina en /uploads
  if (!/\/uploads$/.test(base)) {
    base = base + "/uploads";
  }

  // Normalizar path
  let path = mediaUrl;
  path = path.replace(/\/uploads\/uploads/g, "/uploads");

  if (path.startsWith("uploads/")) {
    path = path.substring("uploads/".length);
  }

  if (path.startsWith("/uploads")) {
    path = path.replace("/uploads", "");
  }

  if (!path.startsWith("/")) path = "/" + path;

  return base + path;
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
