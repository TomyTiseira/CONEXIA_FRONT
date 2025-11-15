'use client';

import React, { useEffect, useState } from 'react';
import { config } from '@/config';
import { FiCreditCard, FiAlertCircle } from 'react-icons/fi';

// ✅ Función para cargar el SDK oficial de MercadoPago desde CDN
const loadMercadoPagoSDK = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.MercadoPago) {
      resolve(window.MercadoPago);
      return;
    }
    
    // Cargar el script del SDK oficial
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = () => reject(new Error('Error al cargar el SDK de MercadoPago'));
    document.head.appendChild(script);
  });
};

export default function CardTokenForm({ plan, billingCycle, onTokenGenerated, onError, loading = false }) {
  const [mp, setMp] = useState(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'DNI',
    identificationNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const amount = billingCycle === 'monthly' ? parseFloat(plan.monthlyPrice) : parseFloat(plan.annualPrice);

  useEffect(() => {
    async function initSDK() {
      try {
        // 🔍 DEBUG: Verificar environment y Public Key
        console.log('════════════════════════════════════════════════════════');
        console.log('🔍 DEBUG: Inicialización de MercadoPago SDK');
        console.log('════════════════════════════════════════════════════════');
        console.log('📌 NODE_ENV:', process.env.NODE_ENV);
        console.log('📌 NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY desde process.env:', 
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 25) + '...');
        console.log('📌 Public Key desde config:', config.MERCADOPAGO_PUBLIC_KEY?.substring(0, 25) + '...');
        console.log('📌 Public Key COMPLETO:', config.MERCADOPAGO_PUBLIC_KEY);
        console.log('════════════════════════════════════════════════════════');
        
        if (!config.MERCADOPAGO_PUBLIC_KEY) {
          throw new Error('MercadoPago Public Key no configurada');
        }
        
        // Validar que el Public Key NO sea el placeholder de desarrollo
        if (config.MERCADOPAGO_PUBLIC_KEY.includes('TEST-xxxxxxxx')) {
          throw new Error('⚠️ CRÍTICO: Usando Public Key de placeholder. Verificar .env.local');
        }
        
        // Validar que sea un Public Key de Argentina (APP_USR- o TEST- pero válido)
        if (!config.MERCADOPAGO_PUBLIC_KEY.startsWith('APP_USR-') && 
            !config.MERCADOPAGO_PUBLIC_KEY.startsWith('TEST-')) {
          throw new Error('⚠️ Public Key inválido. Debe comenzar con APP_USR- o TEST-');
        }
        
        console.log('✅ Public Key validado correctamente');
        console.log('🌍 Cargando SDK oficial de MercadoPago desde CDN...');
        
        // ✅ IMPORTANTE: Cargar SDK oficial desde CDN (más actualizado que npm)
        // El Public Key debe obtenerse de: https://www.mercadopago.com.ar/settings/account/credentials
        await loadMercadoPagoSDK();
        
        // Inicializar con configuración de Argentina
        const mercadoPago = new window.MercadoPago(config.MERCADOPAGO_PUBLIC_KEY, { 
          locale: 'es-AR' // Configuración específica para Argentina
        });
        setMp(mercadoPago);
        setSdkInitialized(true);
        
        console.log('✅ SDK de MercadoPago (CDN v2) inicializado exitosamente');
        console.log('✅ País: Argentina (locale: es-AR)');
        console.log('════════════════════════════════════════════════════════');
      } catch (error) {
        console.error('❌ ERROR al inicializar MercadoPago:', error);
        console.error('Error completo:', error);
        setInitError(error.message);
        onError?.(error);
      }
    }
    initSDK();
  }, [onError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expirationMonth' || name === 'expirationYear') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 13) newErrors.cardNumber = 'Número de tarjeta inválido';
    if (!formData.cardholderName || formData.cardholderName.length < 3) newErrors.cardholderName = 'Nombre del titular requerido';
    if (!formData.expirationMonth || parseInt(formData.expirationMonth) < 1 || parseInt(formData.expirationMonth) > 12) newErrors.expirationMonth = 'Mes inválido';
    if (!formData.expirationYear || formData.expirationYear.length !== 2) newErrors.expirationYear = 'Año inválido';
    if (!formData.securityCode || formData.securityCode.length < 3 || formData.securityCode.length > 4) newErrors.securityCode = 'CVV debe tener 3 o 4 dígitos';
    if (!formData.identificationNumber || formData.identificationNumber.length < 7) newErrors.identificationNumber = 'Número de documento inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setProcessing(true);
    try {
      console.log('════════════════════════════════════════════════════════');
      console.log('🔄 Generando token de tarjeta...');
      console.log('════════════════════════════════════════════════════════');
      console.log('📋 Datos de la tarjeta:');
      console.log('   - Número de tarjeta: ****', formData.cardNumber.slice(-4));
      console.log('   - Tipo de documento:', formData.identificationType);
      console.log('   - País esperado: Argentina (MLA)');
      console.log('   - Public Key usado:', config.MERCADOPAGO_PUBLIC_KEY?.substring(0, 25) + '...');
      
      // ✅ Crear token de tarjeta con datos válidos para Argentina
      // Este token será enviado al backend que debe usar credenciales del mismo país
      // Tipos de identificación válidos para Argentina: DNI, CI, LE, LC, Otro
      const cardToken = await mp.createCardToken({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName.toUpperCase(),
        cardExpirationMonth: formData.expirationMonth,
        cardExpirationYear: formData.expirationYear,
        securityCode: formData.securityCode,
        identificationType: formData.identificationType, // Debe ser: DNI, CI, LE, LC o Otro
        identificationNumber: formData.identificationNumber
      });
      
      console.log('════════════════════════════════════════════════════════');
      console.log('✅ TOKEN GENERADO EXITOSAMENTE');
      console.log('════════════════════════════════════════════════════════');
      console.log('🎫 Card Token ID:', cardToken.id);
      console.log('🔍 Token completo:', JSON.stringify(cardToken, null, 2));
      console.log('⚠️  IMPORTANTE: Verificar que el token tenga site_id = "MLA" (Argentina)');
      console.log('════════════════════════════════════════════════════════');
      
      if (!cardToken || !cardToken.id) throw new Error('No se pudo generar el token de la tarjeta');
      
      onTokenGenerated(cardToken.id);
    } catch (error) {
      console.error('════════════════════════════════════════════════════════');
      console.error('❌ ERROR al generar token:', error);
      console.error('Error completo:', error);
      console.error('════════════════════════════════════════════════════════');
      setErrors({ submit: error.message || 'Error al procesar la tarjeta' });
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  if (initError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Error al inicializar el sistema de pagos</h4>
            <p className="text-sm text-red-700">{initError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sdkInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
        <span className="ml-3 text-gray-600">Cargando sistema de pagos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiCreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">💳 Cobro automático recurrente</p>
            <p className="text-blue-700">
              Esta tarjeta será cargada automáticamente cada <strong>{billingCycle === 'monthly' ? 'mes' : 'año'}</strong> por <strong>{amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>. Puedes cancelar en cualquier momento desde tu panel de usuario.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta *</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent"
            disabled={processing || loading}
          />
          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular *</label>
          <input
            type="text"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleInputChange}
            placeholder="JUAN PEREZ"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent"
            disabled={processing || loading}
          />
          {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
            <input type="text" name="expirationMonth" value={formData.expirationMonth} onChange={handleInputChange} placeholder="MM" maxLength={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent" disabled={processing || loading} />
            {errors.expirationMonth && <p className="text-red-500 text-xs mt-1">{errors.expirationMonth}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
            <input type="text" name="expirationYear" value={formData.expirationYear} onChange={handleInputChange} placeholder="YY" maxLength={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent" disabled={processing || loading} />
            {errors.expirationYear && <p className="text-red-500 text-xs mt-1">{errors.expirationYear}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV * 🔒</label>
            <input type="text" name="securityCode" value={formData.securityCode} onChange={handleInputChange} placeholder="123" maxLength={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent" disabled={processing || loading} />
            {errors.securityCode && <p className="text-red-500 text-xs mt-1">{errors.securityCode}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="identificationType" value={formData.identificationType} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent" disabled={processing || loading}>
              <option value="DNI">DNI</option>
              <option value="CI">CI</option>
              <option value="LE">LE</option>
              <option value="LC">LC</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de documento *</label>
            <input type="text" name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} placeholder="12345678" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent" disabled={processing || loading} />
            {errors.identificationNumber && <p className="text-red-500 text-sm mt-1">{errors.identificationNumber}</p>}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={processing || loading}
          className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {processing || loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Procesando...
            </span>
          ) : (
            'Suscribirse'
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Tus datos están protegidos con encriptación SSL</p>
        <p>✓ MercadoPago procesará los pagos de forma segura</p>
        <p>✓ Puedes cancelar la suscripción en cualquier momento</p>
      </div>
    </form>
  );
}