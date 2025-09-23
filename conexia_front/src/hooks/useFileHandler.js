import { useState, useCallback } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILES = 5;
const MAX_VIDEOS = 1;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const useFileHandler = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const validateFiles = useCallback((currentFiles, newFiles) => {
    const totalFiles = [...currentFiles, ...newFiles];
    
    if (totalFiles.length > MAX_FILES) {
      throw new Error(`Máximo ${MAX_FILES} archivos permitidos`);
    }
    
    const videoCount = totalFiles.filter(f => f.type.startsWith('video/')).length;
    if (videoCount > MAX_VIDEOS) {
      throw new Error(`Máximo ${MAX_VIDEOS} video permitido`);
    }
    
    newFiles.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.type}`);
      }
      
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`El archivo ${file.name} excede los 50MB`);
      }
    });
    
    return true;
  }, []);

  const addFiles = useCallback((newFiles) => {
    try {
      validateFiles(files, newFiles);
      
      // Evitar duplicados por nombre y tamaño
      const allFiles = [...files, ...newFiles];
      const uniqueFiles = [];
      const fileMap = new Map();
      
      for (const f of allFiles) {
        const key = `${f.name}_${f.size}`;
        if (!fileMap.has(key)) {
          fileMap.set(key, true);
          uniqueFiles.push(f);
        }
      }
      
      setFiles(uniqueFiles);
      
      // Generar previews
      const newPreviews = uniqueFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      
      // Limpiar previews anteriores
      previews.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      setPreviews(newPreviews);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [files, previews, validateFiles]);

  const removeFile = useCallback((index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Limpiar preview del archivo removido
    if (previews[index] && previews[index].url) {
      URL.revokeObjectURL(previews[index].url);
    }
    
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  }, [files, previews]);

  const clearFiles = useCallback(() => {
    // Limpiar todas las URLs de preview
    previews.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    setFiles([]);
    setPreviews([]);
  }, [previews]);

  const getFileInfo = useCallback(() => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const imageCount = files.filter(f => f.type.startsWith('image/')).length;
    const videoCount = files.filter(f => f.type.startsWith('video/')).length;
    
    return {
      totalFiles: files.length,
      totalSize,
      imageCount,
      videoCount,
      canAddMore: files.length < MAX_FILES,
      canAddVideo: videoCount === 0
    };
  }, [files]);

  return {
    files,
    previews,
    addFiles,
    removeFile,
    clearFiles,
    getFileInfo,
    maxFiles: MAX_FILES,
    maxVideos: MAX_VIDEOS,
    allowedTypes: ALLOWED_TYPES
  };
};