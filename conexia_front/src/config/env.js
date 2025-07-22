// Configuración de variables de entorno
const ENV = {
  development: {
    API_URL: 'http://localhost:8080/api',
    IMAGE_URL: 'http://localhost:8080/uploads'
  },
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080/uploads'
  },
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || 'development';

// Exportar la configuración del entorno actual
export const config = ENV[currentEnv]; 