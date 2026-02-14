// Utilidad central para construir URLs de medios (imágenes / videos)
// Normaliza variaciones: fileUrl, mediaUrl, file_path, fileName
import { config } from "@/config";

// Construye una URL válida para un medio
// Producción: Backend devuelve URLs completas de GCS → se usan tal cual
// Desarrollo: Backend devuelve paths relativos → se construyen con IMAGE_URL
export function buildMediaUrl(raw) {
  console.log("🔍 buildMediaUrl - raw input:", raw);
  console.log("🔍 buildMediaUrl - IMAGE_URL:", config?.IMAGE_URL);

  if (!raw) return "";
  const mediaUrl = String(raw);

  // Si es URL absoluta (producción - GCS), retornarla sin modificar
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
    console.log(
      "✅ buildMediaUrl - URL absoluta detectada, retornando:",
      mediaUrl,
    );
    return mediaUrl;
  }

  // Desarrollo local: construir con IMAGE_URL
  let base = config?.IMAGE_URL || "";
  if (!base) {
    console.log(
      "⚠️ buildMediaUrl - No hay IMAGE_URL configurada, retornando raw:",
      mediaUrl,
    );
    return mediaUrl; // Fallback si no hay base configurada
  }

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

  const result = base + path;
  console.log("🔨 buildMediaUrl - Construido (dev):", result);
  return result;
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
