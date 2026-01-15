// Script de debugging para verificar respuestas del backend
// Usar en consola del navegador cuando un usuario baneado intente una acción

async function testBackendBanResponse() {
  console.log('🧪 Testing backend ban response...');
  
  try {
    const response = await fetch('http://localhost:8080/api/publications', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status Code:', response.status);
    console.log('📡 Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('📦 Response Body:', data);
    
    if (response.status === 403) {
      console.log('✅ CORRECTO: Backend devuelve 403');
      if (data.reason === 'ACCOUNT_BANNED') {
        console.log('✅ CORRECTO: Metadata incluye reason: "ACCOUNT_BANNED"');
      } else {
        console.warn('⚠️ FALTA: No se encontró reason: "ACCOUNT_BANNED" en la respuesta');
      }
    } else if (response.status === 401) {
      console.error('❌ INCORRECTO: Backend devuelve 401 (debería ser 403)');
      console.error('🔧 FIX REQUERIDO: Verificar jwt-auth.guard.ts en backend');
    }
    
  } catch (error) {
    console.error('❌ Error en request:', error);
  }
}

// Ejecutar automáticamente
testBackendBanResponse();
