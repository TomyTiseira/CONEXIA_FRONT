'use client';

import { useState, useEffect } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

/**
 * Componente de input de teléfono con selector de país y código de área
 * Separa el código de área del número de teléfono para enviar al backend
 */
export default function PhoneInput({ 
  areaCode = '', 
  phoneNumber = '', 
  onAreaCodeChange, 
  onPhoneNumberChange,
  areaCodeError,
  phoneNumberError,
  onBlur
}) {
  // Combinar areaCode y phoneNumber para mostrar en el componente
  const fullPhoneNumber = areaCode && phoneNumber ? `${areaCode}${phoneNumber}` : areaCode || '';
  const [previousValue, setPreviousValue] = useState(fullPhoneNumber);
  
  useEffect(() => {
    setPreviousValue(fullPhoneNumber);
  }, [fullPhoneNumber]);
  
  const handleChange = (value) => {
    // Si intentan borrar todo o dejar solo el código incompleto
    if (!value || value.length < (areaCode?.length || 0)) {
      // Restaurar al valor anterior (mantener el código de área)
      return;
    }

    // Parsear el valor para extraer código de área y número
    // react-phone-number-input devuelve el número en formato E.164 (ej: +541123456789)
    const match = value.match(/^(\+\d{1,4})(\d*)$/);
    
    if (match) {
      const [, code, number] = match;
      
      // Solo actualizar si el código de área cambió o si hay número
      if (code !== areaCode || number !== phoneNumber) {
        onAreaCodeChange?.(code);
        onPhoneNumberChange?.(number || '');
        setPreviousValue(value);
      }
    } else {
      // Si no coincide con el patrón, intentar extraer al menos el código
      const codeMatch = value.match(/^(\+\d{1,4})/);
      if (codeMatch) {
        const code = codeMatch[1];
        const restNumber = value.replace(codeMatch[1], '').replace(/\D/g, ''); // Solo dígitos
        onAreaCodeChange?.(code);
        onPhoneNumberChange?.(restNumber);
        setPreviousValue(value);
      }
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-conexia-green mb-1">
        Teléfono (Opcional)
      </label>
      
      <div className="phone-input-wrapper">
        <PhoneInputWithCountry
          international
          withCountryCallingCode
          countryCallingCodeEditable={false}
          defaultCountry="AR"
          value={fullPhoneNumber}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder="Ingresa tu número de teléfono"
          numberInputProps={{
            className: `w-full px-3 py-2 border rounded-lg text-base outline-none transition-all ${
              (areaCodeError || phoneNumberError) 
                ? 'border-red-500 ring-2 ring-red-100' 
                : 'border-gray-300 focus:border-conexia-green focus:ring-2 focus:ring-conexia-green/20'
            }`
          }}
        />
      </div>
      
      {/* Errores */}
      {areaCodeError && (
        <p className="text-xs text-red-600 mt-1">{areaCodeError}</p>
      )}
      {phoneNumberError && (
        <p className="text-xs text-red-600 mt-1">{phoneNumberError}</p>
      )}
      
      {/* Ayuda - solo cuando no hay número escrito */}
      {!areaCodeError && !phoneNumberError && !phoneNumber && (
        <p className="text-xs text-gray-500 mt-1">
          Selecciona el país y escribe tu número sin el código de área
        </p>
      )}
    </div>
  );
}
