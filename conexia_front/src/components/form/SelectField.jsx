'use client';
import { ChevronDown } from 'lucide-react'; // Ícono moderno

export default function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  placeholder = 'Seleccionar',
}) {
  const isPlaceholder = value === '';

  return (
    <div className="min-h-[64px] relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-4 py-2 pr-10 border rounded focus:outline-none focus:ring h-10 text-base appearance-none
          ${error
            ? 'border-red-500 ring-red-300'
            : 'border-gray-300 focus:ring-conexia-green/40'
          }`}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute top-2.5 right-3 text-conexia-green">
        <ChevronDown size={18} />
      </div>

      <p className="text-xs text-red-600 mt-1 text-left h-[30px]">{error}</p>
    </div>
  );
}
