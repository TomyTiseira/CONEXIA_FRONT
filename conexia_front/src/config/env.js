// Configuración de variables de entorno
const ENV = {
  development: {
    API_URL: 'http://localhost:8080/api'
  },
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  }
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || 'development';

// Exportar la configuración del entorno actual
export const config = ENV[currentEnv]; 