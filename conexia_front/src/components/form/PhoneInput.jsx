'use client';

import { useState, useEffect } from 'react';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';

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
  const countries = getCountries();
  const [selectedCountry, setSelectedCountry] = useState('');

  // Inicializar el país basado en el areaCode si existe
  useEffect(() => {
    if (areaCode && !selectedCountry) {
      const code = areaCode.replace('+', '');
      const country = countries.find(
        (c) => getCountryCallingCode(c) === code
      );
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [areaCode, selectedCountry, countries]);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    
    if (country) {
      const code = `+${getCountryCallingCode(country)}`;
      onAreaCodeChange?.(code);
    } else {
      onAreaCodeChange?.('');
      onPhoneNumberChange?.('');
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    onPhoneNumberChange?.(value);
  };

  // Obtener la bandera del país seleccionado
  const getFlag = (countryCode) => {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-conexia-green mb-1">
        Teléfono (Opcional)
      </label>
      
      <div className="flex gap-3">
        {/* Select de País con código */}
        <div className="min-h-[64px]" style={{ width: '140px' }}>
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              onBlur={onBlur}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring appearance-none bg-white cursor-pointer ${
                areaCodeError
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-conexia-green/40'
              } ${selectedCountry ? 'text-transparent' : 'text-conexia-green'}`}
              style={{ 
                paddingLeft: selectedCountry ? '0.75rem' : '1rem',
                paddingRight: '2rem'
              }}
            >
              <option value="" className="text-gray-700">Cód. Área</option>
              {countries.map((country) => (
                <option key={country} value={country} className="text-conexia-green">
                  {country} {en[country]} (+{getCountryCallingCode(country)})
                </option>
              ))}
            </select>
            
            {/* Código de país y área cuando está seleccionado */}
            {selectedCountry && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 bg-white px-1">
                <span className="text-sm font-semibold text-gray-700">
                  {selectedCountry}
                </span>
                <span className="text-sm text-gray-600">
                  +{getCountryCallingCode(selectedCountry)}
                </span>
              </div>
            )}
            
            {/* Flecha del select */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-1 text-left h-[30px]">
            {areaCodeError || ' '}
          </p>
        </div>

        {/* Input de Número de Teléfono */}
        <div className="min-h-[64px] flex-1">
          <input
            type="text"
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={onBlur}
            disabled={!selectedCountry}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
              phoneNumberError
                ? 'border-red-500 ring-red-300'
                : 'border-gray-300 focus:ring-conexia-green/40'
            } ${!selectedCountry ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          <p className="text-xs text-red-600 mt-1 text-left h-[30px]">
            {phoneNumberError || ' '}
          </p>
        </div>
      </div>
      
    </div>
  );
}
