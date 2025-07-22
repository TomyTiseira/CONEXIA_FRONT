'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function InternalUsersFilters({ filters, setFilters }) {
  const [localEmail, setLocalEmail] = useState(filters.email);
  const [localStart, setLocalStart] = useState(filters.startDate);
  const [localEnd, setLocalEnd] = useState(filters.endDate);
  const [includeDeleted, setIncludeDeleted] = useState(filters.includeDeleted);

  const handleApply = () => {
    setFilters({
      email: localEmail,
      startDate: localStart,
      endDate: localEnd,
      includeDeleted,
      page: 1,
      limit: filters.limit,
    });
  };

  const inputClasses =
    'h-9 border border-conexia-green rounded px-3 text-sm placeholder-conexia-green text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition w-full';

  const dateInputClasses =
    "h-9 min-w-[150px] border border-conexia-green rounded px-3 text-sm text-conexia-green bg-white focus:outline-none focus:ring-1 focus:ring-conexia-green hover:border-2 hover:border-conexia-green focus:border-2 focus:border-conexia-green"

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-y-3 gap-x-6 flex-wrap">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <label className="text-sm text-conexia-green whitespace-nowrap">Email:</label>
          <input
            type="email"
            placeholder="Buscar por email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <label className="text-sm text-conexia-green whitespace-nowrap">Fecha alta desde:</label>
          <input
            type="date"
            value={localStart}
            max={localEnd || undefined}
            onChange={(e) => setLocalStart(e.target.value)}
            className={dateInputClasses}
            onKeyDown={(e) => e.preventDefault()} // Previene escritura con teclado
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <label className="text-sm text-conexia-green whitespace-nowrap">Fecha alta hasta:</label>
          <input
            type="date"
            value={localEnd}
            min={localStart || undefined}
            onChange={(e) => setLocalEnd(e.target.value)}
            className={dateInputClasses}
            onKeyDown={(e) => e.preventDefault()} // Previene escritura con teclado
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="accent-conexia-green"
          />
          <label className="text-sm text-conexia-green">Incluir inactivos</label>
        </div>

        <Button variant="primary" onClick={handleApply} className="h-9 px-4 py-0 text-sm w-full md:w-auto">
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
}
