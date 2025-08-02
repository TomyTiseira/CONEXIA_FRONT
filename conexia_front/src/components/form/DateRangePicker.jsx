'use client';

// Helper para obtener la fecha de hoy en formato yyyy-mm-dd
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
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
}) {
  const minStart = getToday();
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
      {/* Fecha hasta */}
      <div className="w-full md:w-1/2">
        <label className={`block text-sm font-semibold text-conexia-green-dark mb-0.5 ${labelClassName}`}>{endLabel}</label>
        <input
          type="date"
          value={end}
          min={start || minStart}
          onChange={onEndChange}
          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring pr-10 h-10 text-base appearance-none
            ${errorEnd ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-conexia-green/40'}
            ${inputClassName}`}
          onKeyDown={disableTyping ? (e) => e.preventDefault() : undefined}
        />
        <p className="text-xs text-red-600 mt-1 text-left h-[30px]">{errorEnd}</p>
      </div>
    </div>
  );
}