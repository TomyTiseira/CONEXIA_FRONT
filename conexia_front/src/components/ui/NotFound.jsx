'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = ({ 
  title = "Página no encontrada", 
  message = "La página que buscas no existe o no tienes permisos para acceder a ella.",
  showBackButton = true,
  showHomeButton = true 
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {title}
        </h2>
        
        <p style={{ marginBottom: '1.5rem' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {showBackButton && (
            <button
              onClick={handleGoBack}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ccc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Volver
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ir al Inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 