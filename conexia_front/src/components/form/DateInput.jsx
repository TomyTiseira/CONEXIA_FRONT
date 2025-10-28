"use client";

import React from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

// Registrar el idioma español
registerLocale('es', es);

/**
 * DateInput Component
 * 
 * A styled date picker component using react-datepicker with Spanish locale.
 * 
 * @param {Object} props
 * @param {Date|null} props.value - The selected date value
 * @param {Function} props.onChange - Callback function when date changes (receives Date object)
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.placeholder] - Placeholder text
 * @param {Date} [props.maxDate] - Maximum selectable date
 * @param {Date} [props.minDate] - Minimum selectable date
 * @param {boolean} [props.disabled] - Whether the input is disabled
 */
const DateInput = ({ 
  value, 
  onChange, 
  error, 
  placeholder = "dd/mm/aaaa",
  maxDate,
  minDate,
  disabled = false
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          locale="es"
          placeholderText={placeholder}
          maxDate={maxDate}
          minDate={minDate}
          disabled={disabled}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className={`
            w-full px-3 py-2 pr-10
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-conexia-green
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          wrapperClassName="w-full"
          calendarClassName="custom-datepicker"
        />
        <Calendar 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={20}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
