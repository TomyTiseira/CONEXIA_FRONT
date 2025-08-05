'use client';

// Helper para obtener la fecha de hoy en formato yyyy-mm-dd
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
}

// Helper para obtener la fecha de mañana en formato yyyy-mm-dd
function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString().split('T')[0];
}

export default function DateRangePicker({
  startLabel = 'Fecha desde:',
  endLabel = 'Fecha hasta:',
  start,
  end,
  onStartChange,
  onEndChange,
  errorStart,
  errorEnd,
  inputClassName = '',
  labelClassName = '',
  containerClassName = '',
  disableTyping = true,
  hideEnd = false,
  isIndefinite = false,
  onIndefiniteChange,
}) {
  const minStart = getTomorrow();
  return (
    <div className={`w-full flex flex-col md:flex-row gap-4 ${containerClassName}`}>
      {/* Fecha desde */}
      <div className="w-full md:w-1/2">
        <label className={`block text-sm font-semibold text-conexia-green-dark mb-0.5 ${labelClassName}`}>{startLabel}</label>
        <input
          type="date"
          value={start}
          min={minStart}
          max={end || undefined}
          onChange={onStartChange}
          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring pr-10 h-10 text-base appearance-none
            ${errorStart ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-conexia-green/40'}
            ${inputClassName}`}
          onKeyDown={disableTyping ? (e) => e.preventDefault() : undefined}
        />
        <p className="text-xs text-red-600 mt-1 text-left h-[30px]">{errorStart}</p>
      </div>
      {/* Fecha hasta - siempre visible */}
      <div className="w-full md:w-1/2">
        <label className={`block text-sm font-semibold text-conexia-green-dark mb-0.5 ${labelClassName}`}>{endLabel}</label>
        <input
          type="date"
          value={isIndefinite ? '' : end}
          min={start || minStart}
          onChange={onEndChange}
          disabled={isIndefinite}
          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring pr-10 h-10 text-base appearance-none
            ${errorEnd ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-conexia-green/40'}
            ${isIndefinite ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${inputClassName}`}
          onKeyDown={disableTyping ? (e) => e.preventDefault() : undefined}
        />
        {/* Checkbox para fecha indefinida - justo debajo del campo fecha hasta */}
        {onIndefiniteChange && (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="indefinite-date"
              checked={isIndefinite}
              onChange={(e) => onIndefiniteChange(e.target.checked)}
              className="accent-conexia-green"
            />
            <label htmlFor="indefinite-date" className="text-sm text-conexia-green-dark cursor-pointer">
              Fecha hasta indefinida
            </label>
          </div>
        )}
        <p className="text-xs text-red-600 mt-1 text-left h-[30px]">{errorEnd}</p>
      </div>
    </div>
  );
}