// Utilidad central para construir URLs de medios (imágenes / videos)
// Normaliza variaciones: fileUrl, mediaUrl, file_path, fileName
import { config } from '@/config';

// Construye una URL válida para un medio evitando duplicar /uploads
// Casos soportados:
//  - raw ya es URL absoluta -> se retorna igual
//  - raw comienza con /uploads/...
//  - raw comienza con uploads/...
//  - raw comienza con /... (sin uploads)
//  - raw es solo un nombre/segmento
export function buildMediaUrl(raw) {
  if (!raw) return '';
  let mediaUrl = String(raw);
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;

  let base = config?.IMAGE_URL || '';
  // Normalizar base removiendo slash final
  base = base.replace(/\/$/, '');

  // Asegurar que la base termina en /uploads (este backend expone archivos ahí)
  if (!/\/uploads$/.test(base)) {
    base = base + '/uploads';
  }

  // Normalizar mediaUrl para evitar duplicados
  // Reemplazar ocurrencias dobles /uploads/uploads -> /uploads
  mediaUrl = mediaUrl.replace(/\/uploads\/uploads/g, '/uploads');

  // Quitar prefijo 'uploads/' si viene sin slash inicial
  if (mediaUrl.startsWith('uploads/')) {
    mediaUrl = mediaUrl.substring('uploads/'.length);
  }

  // Si inicia con /uploads ya tenemos el prefijo: quitamos solo la primera aparición para concatenar
  if (mediaUrl.startsWith('/uploads')) {
    mediaUrl = mediaUrl.replace('/uploads', ''); // queda /resto o vacío
  }

  // Si llega como ruta absoluta que no contiene uploads (empieza con /) la anexamos detrás de /uploads
  if (mediaUrl.startsWith('/') && !mediaUrl.startsWith('/')) {
    // (caso imposible por la condición, se deja por claridad)
  }

  // Asegurar que mediaUrl empieza con '/'
  if (!mediaUrl.startsWith('/')) mediaUrl = '/' + mediaUrl;

  return base + mediaUrl;
}

// Extrae la URL efectiva desde un objeto de media con diferentes keys
export function extractMediaPath(mediaObj) {
  if (!mediaObj || typeof mediaObj !== 'object') return '';
  return mediaObj.fileUrl || mediaObj.mediaUrl || mediaObj.file_path || mediaObj.file || mediaObj.fileName || '';
}

// Helper completo: pasa objeto media y construye URL final
export function getMediaUrlFromObject(mediaObj) {
  return buildMediaUrl(extractMediaPath(mediaObj));
}
