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
      // Error loading layout
    }
  }, [storageKey]);

  // Inicializar Swapy cuando el container esté disponible
  useEffect(() => {
    if (!container) {
      return;
    }
    
    // Evitar reinicializar si ya existe
    if (swapyInstance.current) {
      return;
    }

    // Delay para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      try {
        if (!container) {
          return;
        }

        // Verificar que existen slots e items
        const slots = container.querySelectorAll('[data-swapy-slot]');
        const items = container.querySelectorAll('[data-swapy-item]');
        
        if (slots.length === 0 || items.length === 0) {
          setIsSwapyReady(false);
          return;
        }

        // Crear instancia de Swapy con animación más lenta y suave
        const swapy = createSwapy(container, {
          animation: 'dynamic', // dynamic es más suave y configurable que spring
        });

        // Habilitar por defecto
        swapy.enable(true);

        // Escuchar cambios en el layout
        swapy.onSwap((event) => {
          // El evento puede tener diferentes estructuras según la versión de Swapy
          const newLayout = event?.data?.object || event?.object || event;
          
          if (newLayout) {
            setLayout(newLayout);
            
            // Guardar en localStorage
            try {
              localStorage.setItem(storageKey, JSON.stringify(newLayout));
            } catch (error) {
              // Error saving layout
            }
          }
        });

        swapyInstance.current = swapy;
        setIsSwapyReady(true);

      } catch (error) {
        setIsSwapyReady(false);
      }
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (swapyInstance.current) {
        try {
          swapyInstance.current.destroy();
        } catch (e) {
          // Error destroying Swapy
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
      // Error resetting layout
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
