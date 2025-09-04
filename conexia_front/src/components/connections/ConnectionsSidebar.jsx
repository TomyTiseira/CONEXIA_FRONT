'use client';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import React from 'react';
import { UserPlus, Users, UserCheck, UserX } from 'lucide-react';

const sections = [
  {
    key: 'recommended',
    label: 'Recomendadas',
    icon: Users,
    description: 'Personas sugeridas para conectar',
  },
  {
    key: 'requests',
    label: 'Solicitudes',
    icon: UserPlus,
    description: 'Solicitudes de conexión recibidas',
  },
  {
    key: 'my-connections',
    label: 'Mis conexiones',
    icon: Users,
    description: 'Personas con las que ya conectaste',
  },
  {
    key: 'sent',
    label: 'Enviadas',
    icon: UserCheck,
    description: 'Solicitudes enviadas por ti',
  },
];

export default function ConnectionsSidebar({ selected, onSelect }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex sticky top-24 bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-8 py-8 flex-col gap-4 mt-0 transition-all mx-0"
        style={{ minWidth: '320px', maxWidth: 440, width: '100%', height: 'fit-content', minHeight: 320 }}
      >
        <h2 className="text-conexia-green font-semibold text-xl tracking-tight mb-4">Panel de conexiones</h2>
        <nav className="flex flex-col gap-2">
          {sections.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left hover:bg-conexia-green/10 focus:outline-none border border-transparent ${
                selected === key ? 'bg-conexia-green/10 border-conexia-green text-conexia-green font-semibold shadow-md' : 'text-conexia-green/80'
              }`}
              aria-current={selected === key}
              style={{ minHeight: 56 }}
            >
              <Icon size={22} className="shrink-0" />
              <span className="flex flex-col items-start w-full">
                <span className="text-base leading-tight">{label}</span>
                <span className="text-xs text-conexia-green/60 leading-tight">{description}</span>
              </span>
            </button>
          ))}
        </nav>
      </aside>
      {/* Mobile */}
      <nav
        className="md:hidden w-full bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 p-2 flex flex-row justify-between items-center transition-shadow mt-2 mb-6"
      >
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex flex-col items-center flex-1 px-1 py-2 rounded-lg transition ${
              selected === key
                ? 'bg-conexia-green/10 text-conexia-green font-semibold shadow-md'
                : 'hover:bg-conexia-green/5 text-conexia-green/80'
            }`}
            onClick={() => onSelect(key)}
          >
            <Icon size={22} className="shrink-0" />
            <span className="text-xs mt-1 leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
