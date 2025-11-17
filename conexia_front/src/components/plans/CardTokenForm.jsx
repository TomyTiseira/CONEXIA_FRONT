'use client';

import React, { useEffect, useState, useRef } from 'react';
import { config } from '@/config';
import { FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import Toast from '@/components/ui/Toast';

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
  const [cardForm, setCardForm] = useState(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    cardholderName: '',
    identificationType: 'DNI',
    identificationNumber: '',
    cardholderEmail: ''
  });
  const formMountedRef = useRef(false);

  const amount = billingCycle === 'monthly' ? parseFloat(plan.monthlyPrice) : parseFloat(plan.annualPrice);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mp || processing) return;

    setProcessing(true);
    try {
      console.log('════════════════════════════════════════════════════════');
      console.log('🔄 Generando token con validación CVV...');
      console.log('════════════════════════════════════════════════════════');

      // ✅ MÉTODO CORRECTO: mp.fields.createCardToken incluye validación CVV
      const cardToken = await mp.fields.createCardToken({
        cardholderName: formData.cardholderName,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber,
      });

      console.log('✅ TOKEN GENERADO CON CVV VALIDADO');
      console.log('🎫 Token ID:', cardToken.id);
      console.log('💳 Card Last 4:', cardToken.last_four_digits);
      console.log('🔒 CVV Validado:', cardToken.security_code_length ? 'SÍ' : 'N/A');
      console.log('════════════════════════════════════════════════════════');

      if (!cardToken || !cardToken.id) {
        throw new Error('No se pudo generar el token');
      }

      onTokenGenerated(cardToken.id);
    } catch (error) {
      console.error('❌ ERROR al generar token:', error);
      setToast({
        type: 'error',
        message: error.message || 'Error al procesar la tarjeta',
        isVisible: true
      });
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    async function initSDK() {
      try {
        console.log('════════════════════════════════════════════════════════');
        console.log('🔍 DEBUG: Inicialización de MercadoPago SDK con CardForm');
        console.log('════════════════════════════════════════════════════════');
        console.log('📌 Public Key:', config.MERCADOPAGO_PUBLIC_KEY?.substring(0, 25) + '...');
        console.log('📌 Monto:', amount);
        console.log('════════════════════════════════════════════════════════');
        
        if (!config.MERCADOPAGO_PUBLIC_KEY) {
          throw new Error('MercadoPago Public Key no configurada');
        }
        
        if (config.MERCADOPAGO_PUBLIC_KEY.includes('TEST-xxxxxxxx')) {
          throw new Error('⚠️ CRÍTICO: Usando Public Key de placeholder. Verificar .env.local');
        }
        
        if (!config.MERCADOPAGO_PUBLIC_KEY.startsWith('APP_USR-') && 
            !config.MERCADOPAGO_PUBLIC_KEY.startsWith('TEST-')) {
          throw new Error('⚠️ Public Key inválido. Debe comenzar con APP_USR- o TEST-');
        }
        
        console.log('✅ Public Key validado correctamente');
        console.log('🌍 Cargando SDK oficial de MercadoPago desde CDN...');
        
        await loadMercadoPagoSDK();
        
        // ✅ Inicializar MercadoPago con locale Argentina
        const mercadoPago = new window.MercadoPago(config.MERCADOPAGO_PUBLIC_KEY, { 
          locale: 'es-AR'
        });
        setMp(mercadoPago);
        
        console.log('✅ SDK de MercadoPago inicializado');
        console.log('⏳ Esperando montaje del formulario...');
        
      } catch (error) {
        console.error('❌ ERROR al inicializar MercadoPago:', error);
        setInitError(error.message);
        onError?.(error);
      }
    }
    initSDK();
  }, [onError, amount]);

  // ✅ Inicializar Fields cuando el MP SDK esté listo
  useEffect(() => {
    if (!mp || formMountedRef.current) return;

    const timer = setTimeout(() => {
      try {
        console.log('🎨 Inicializando MercadoPago Fields (con validación CVV)...');
        
        // Crear campos seguros de MercadoPago
        const cardNumberElement = mp.fields.create('cardNumber', {
          placeholder: 'Número de tarjeta'
        }).mount('form-checkout__cardNumber');

        const expirationDateElement = mp.fields.create('expirationDate', {
          placeholder: 'MM/YY'
        }).mount('form-checkout__expirationDate');

        const securityCodeElement = mp.fields.create('securityCode', {
          placeholder: 'CVV'
        }).mount('form-checkout__securityCode');

        console.log('✅ Fields montados exitosamente');
        console.log('✅ CVV será validado correctamente');
        setSdkInitialized(true);
        formMountedRef.current = true;
        
      } catch (error) {
        console.error('❌ ERROR al crear Fields:', error);
        setInitError(error.message);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mp]);

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

  // Siempre mostrar el formulario para que el CardForm pueda montarse
  // if (!sdkInitialized) {
  //   return (
  //     <div className="flex items-center justify-center py-8">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
  //       <span className="ml-3 text-gray-600">Cargando sistema de pagos...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiCreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Cobro automático recurrente</p>
            <p className="text-blue-700">
              Esta tarjeta será cargada automáticamente cada <strong>{billingCycle === 'monthly' ? 'mes' : 'año'}</strong> por <strong>{amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>. Puedes cancelar en cualquier momento desde tu panel de usuario.
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de carga mientras se monta el CardForm */}
      {!sdkInitialized && (
        <div className="flex items-center justify-center py-8 border border-gray-200 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
          <span className="ml-3 text-gray-600">Cargando sistema de pagos...</span>
        </div>
      )}

      {/* ✅ CardForm de MercadoPago (genera tokens CON site_id) */}
      {/* IMPORTANTE: El formulario SIEMPRE debe estar en el DOM para que CardForm pueda montarse */}
      <div className="border border-gray-200 rounded-lg p-6">
        <style jsx>{`
          .container {
            height: 45px;
            display: inline-block;
            border: 1px solid rgb(209, 213, 219);
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            width: 100%;
            margin-bottom: 1rem;
          }
          #form-checkout {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          #form-checkout input[type="text"],
          #form-checkout input[type="email"],
          #form-checkout select {
            width: 100%;
            padding: 0.5rem 1rem;
            border: 1px solid rgb(209, 213, 219);
            border-radius: 0.5rem;
            font-size: 1rem;
          }
          #form-checkout select {
            background: white;
          }
          #form-checkout button[type="submit"] {
            width: 100%;
            background: #10b981;
            color: white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          }
          #form-checkout button[type="submit"]:hover {
            background: #059669;
          }
          #form-checkout button[type="submit"]:disabled {
            background: rgb(209, 213, 219);
            cursor: not-allowed;
          }
        `}</style>

        <form id="form-checkout" onSubmit={handleSubmit} style={{ opacity: sdkInitialized ? 1 : 0.3, pointerEvents: sdkInitialized ? 'auto' : 'none' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de tarjeta *</label>
            <div id="form-checkout__cardNumber" className="container"></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento *</label>
            <div id="form-checkout__expirationDate" className="container"></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CVV * 🔒</label>
            <div id="form-checkout__securityCode" className="container"></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titular de la tarjeta *</label>
            <input 
              type="text" 
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="JUAN PEREZ"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo doc.</label>
              <select 
                name="identificationType"
                value={formData.identificationType}
                onChange={handleInputChange}
              >
                <option value="DNI">DNI</option>
                <option value="CI">CI</option>
                <option value="LE">LE</option>
                <option value="LC">LC</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nro. documento *</label>
              <input 
                type="text" 
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleInputChange}
                placeholder="12345678"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input 
              type="email" 
              name="cardholderEmail"
              value={formData.cardholderEmail}
              onChange={handleInputChange}
              placeholder="user@email.com"
              required
            />
          </div>

          <button type="submit" disabled={processing || loading}>
            {processing || loading ? 'Procesando...' : 'Suscribirse'}
          </button>
        </form>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Tus datos están protegidos con encriptación SSL</p>
        <p>✓ MercadoPago procesará los pagos de forma segura</p>
        <p>✓ Puedes cancelar la suscripción en cualquier momento</p>
      </div>

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          duration={6000}
        />
      )}
    </div>
  );
}