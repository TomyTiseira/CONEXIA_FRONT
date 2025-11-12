import { useEffect, useRef, useState, useCallback } from 'react';
import { createSwapy } from 'swapy';

/**
 * Hook personalizado para manejar Swapy y la persistencia del layout del dashboard
 * @param {string} storageKey - Key para guardar el layout en localStorage
 * @param {Object} defaultLayout - Layout por defecto si no hay guardado
 * @returns {Object} { containerRef, layout, resetLayout, isSwapyReady }
 */
export const useSwapyLayout = (storageKey = 'conexia-dashboard-layout', defaultLayout = null) => {
  const [container, setContainer] = useState(null);
  const swapyInstance = useRef(null);
  const [layout, setLayout] = useState(defaultLayout);
  const [isSwapyReady, setIsSwapyReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  
  // Callback ref que se ejecuta cuando el elemento está disponible
  const containerRef = useCallback((node) => {
    if (node) {
      console.log('✅ Container ref asignado:', node);
      setContainer(node);
    }
  }, []);

  // Cargar layout guardado del localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedLayout = localStorage.getItem(storageKey);
      if (savedLayout) {
        setLayout(JSON.parse(savedLayout));
      }
    } catch (error) {
      console.error('Error al cargar layout:', error);
    }
  }, [storageKey]);

  // Inicializar Swapy cuando el container esté disponible
  useEffect(() => {
    if (!container) {
      console.log('⚠️ Container no está disponible aún');
      return;
    }
    
    // Evitar reinicializar si ya existe
    if (swapyInstance.current) {
      console.log('⚠️ Swapy ya inicializado');
      return;
    }

    // Delay para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      try {
        if (!container) {
          console.log('❌ Container no disponible después del delay');
          return;
        }

        // Verificar que existen slots e items
        const slots = container.querySelectorAll('[data-swapy-slot]');
        const items = container.querySelectorAll('[data-swapy-item]');
        
        console.log('🎯 Inicializando Swapy...');
        console.log('   Slots encontrados:', slots.length);
        console.log('   Items encontrados:', items.length);
        
        if (slots.length === 0 || items.length === 0) {
          console.error('❌ No se encontraron slots o items para Swapy');
          setIsSwapyReady(false);
          return;
        }

        // Crear instancia de Swapy con animación más lenta y suave
        const swapy = createSwapy(container, {
          animation: 'dynamic', // dynamic es más suave y configurable que spring
        });

        console.log('✅ Swapy inicializado correctamente');

        // Habilitar por defecto
        swapy.enable(true);

        // Escuchar cambios en el layout
        swapy.onSwap((event) => {
          console.log('🔄 Swap event completo:', event);
          
          // El evento puede tener diferentes estructuras según la versión de Swapy
          const newLayout = event?.data?.object || event?.object || event;
          
          if (newLayout) {
            console.log('🔄 Layout cambiado:', newLayout);
            setLayout(newLayout);
            
            // Guardar en localStorage
            try {
              localStorage.setItem(storageKey, JSON.stringify(newLayout));
              console.log('💾 Layout guardado en localStorage');
            } catch (error) {
              console.error('Error al guardar layout:', error);
            }
          } else {
            console.warn('⚠️ No se pudo extraer el layout del evento');
          }
        });

        swapyInstance.current = swapy;
        setIsSwapyReady(true);

      } catch (error) {
        console.error('❌ Error al inicializar Swapy:', error);
        console.error('   Detalles:', error.message);
        console.error('   Stack:', error.stack);
        setIsSwapyReady(false);
      }
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (swapyInstance.current) {
        console.log('🧹 Limpiando Swapy');
        try {
          swapyInstance.current.destroy();
        } catch (e) {
          console.error('Error al destruir Swapy:', e);
        }
        swapyInstance.current = null;
        setIsSwapyReady(false);
      }
    };
  }, [container, storageKey]);

  // Función para resetear el layout a valores por defecto
  const resetLayout = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLayout(defaultLayout);
      
      if (swapyInstance.current && defaultLayout) {
        swapyInstance.current.update(defaultLayout);
      }
    } catch (error) {
      console.error('Error al resetear layout:', error);
    }
  }, [storageKey, defaultLayout]);

  // Habilitar/deshabilitar Swapy
  const toggleSwapy = useCallback((enabled) => {
    if (swapyInstance.current) {
      swapyInstance.current.enable(enabled);
    }
  }, []);

  return {
    containerRef,
    layout,
    resetLayout,
    toggleSwapy,
    isSwapyReady,
  };
};
