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
    'h-8 border border-conexia-green rounded px-3 text-sm placeholder-conexia-green text-conexia-green focus:outline-none focus:ring-1 focus:ring-conexia-green transition';

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row md:items-center md:justify-center gap-4">
      <input
        type="email"
        placeholder="Buscar por email"
        value={localEmail}
        onChange={(e) => setLocalEmail(e.target.value)}
        className={inputClasses}
      />
      <input
        type="date"
        value={localStart}
        onChange={(e) => setLocalStart(e.target.value)}
        className={inputClasses}
      />
      <input
        type="date"
        value={localEnd}
        onChange={(e) => setLocalEnd(e.target.value)}
        className={inputClasses}
      />
      <label className="flex items-center gap-2 text-sm text-conexia-green">
        <input
          type="checkbox"
          checked={includeDeleted}
          onChange={(e) => setIncludeDeleted(e.target.checked)}
          className="accent-conexia-green"
        />
        Incluir inactivos
      </label>
      <Button variant="primary" onClick={handleApply} className="h-8 px-4 py-0 text-sm">
        Aplicar filtros
      </Button>
    </div>
  );
}
