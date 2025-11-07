// Configuración de variables de entorno
const ENV = {
  development: {
    API_URL: 'http://localhost:8080/api',
    IMAGE_URL: 'http://localhost:8080/uploads',
    DOCUMENT_URL: 'http://localhost:8080',
    MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080/uploads',
    DOCUMENT_URL: process.env.NEXT_PUBLIC_DOCUMENT_URL || 'http://localhost:8080',
    MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  },
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || 'development';

// Exportar la configuración del entorno actual
export const config = ENV[currentEnv]; 