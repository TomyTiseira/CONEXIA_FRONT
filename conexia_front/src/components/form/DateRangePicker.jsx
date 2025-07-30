'use client';

export default function DateRangePicker({ start, end, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-conexia-green mb-1 block">Fecha desde</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={start}
          onChange={(e) => onChange('start', e.target.value)}
          onKeyDown={(e) => e.preventDefault()}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-conexia-green mb-1 block">Fecha hasta</label>
        <input
          type="date"
          min={start || undefined}
          value={end}
          onChange={(e) => onChange('end', e.target.value)}
          onKeyDown={(e) => e.preventDefault()}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
    </div>
  );
}
