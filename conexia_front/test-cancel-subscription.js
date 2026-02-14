/**
 * Script de prueba para el endpoint de cancelación de suscripción
 * Ejecutar en la consola del navegador después de iniciar sesión
 * 
 * IMPORTANTE: Debes tener una suscripción activa para probar
 * NUEVO: Ahora acepta un motivo opcional de cancelación
 */

async function testCancelSubscription(reason = null) {
  console.log('🧪 Probando cancelación de suscripción...\n');
  
  const body = reason ? JSON.stringify({ reason }) : undefined;
  
  try {
    const response = await fetch('http://localhost:8080/api/memberships/me/subscription', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ajustar según tu implementación
        'Content-Type': 'application/json'
      },
      body: body
    });
    
    console.log('📡 Status Code:', response.status);
    console.log('📡 Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('📦 Response Body:', JSON.stringify(data, null, 2));
    
    // Validar respuesta exitosa (200)
    if (response.status === 200 && data.success) {
      console.log('\n✅ ÉXITO: Suscripción cancelada correctamente');
      console.log(`   - ID: ${data.subscription.id}`);
      console.log(`   - Estado: ${data.subscription.status} (debería ser "pending_cancellation")`);
      console.log(`   - Plan: ${data.subscription.planName}`);
      console.log(`   - Fecha fin del ciclo: ${data.subscription.endDate}`);
      console.log(`   - Fecha de cancelación: ${data.subscription.cancellationDate}`);
      console.log(`   - Motivo: ${data.subscription.cancellationReason || '(sin motivo)'}`);
      console.log(`   - MercadoPago ID: ${data.subscription.mercadoPagoSubscriptionId}`);
    }
    // Validar error 404 (no hay suscripción activa)
    else if (response.status === 404) {
      console.log('\n⚠️ ERROR 404: No hay suscripción activa');
      console.log(`   Mensaje: ${data.message}`);
    }
    // Validar error 400 (ya está cancelada)
    else if (response.status === 400) {
      console.log('\n⚠️ ERROR 400: La suscripción ya está cancelada');
      console.log(`   Mensaje: ${data.message}`);
    }
    // Validar error 500 (error en MercadoPago)
    else if (response.status === 500) {
      console.log('\n❌ ERROR 500: Error al cancelar en MercadoPago');
      console.log(`   Mensaje: ${data.message}`);
    }
    else {
      console.log('\n❓ Respuesta inesperada');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la petición:', error);
  }
}

// Ejecutar automáticamente
console.log('Para probar la cancelación de suscripción, ejecuta:');
console.log('  testCancelSubscription()                                 // Sin motivo');
console.log('  testCancelSubscription("No me sirvió el servicio")       // Con motivo');
