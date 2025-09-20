import React from 'react';

export default function SearchSidebar({ sections, selected, onSelect }) {
  return (
    <aside
      className="sticky top-24 bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-8 py-8 flex-col gap-4 mt-0 transition-all mx-0"
      style={{ minWidth: '320px', maxWidth: 440, width: '100%', height: 'fit-content', minHeight: 320 }}
    >
      <h2 className="text-conexia-green font-semibold text-xl tracking-tight mb-4">Panel de búsqueda</h2>
      <nav className="flex flex-col gap-2">
        {sections.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="relative w-full">
            <button
              onClick={() => onSelect(key)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left hover:bg-conexia-green/10 focus:outline-none border border-transparent w-full ${
                selected === key ? 'bg-conexia-green/10 border-conexia-green text-conexia-green font-semibold shadow-md' : 'text-conexia-green/80'
              }`}
              aria-current={selected === key}
              style={{ minHeight: 56 }}
            >
              <Icon size={22} className="shrink-0 text-conexia-green/80" />
              <span className="flex flex-col items-start w-full relative">
                <span className="text-base leading-tight flex items-center">
                  {label}
                </span>
                <span className="text-xs text-conexia-green/60 leading-tight">{description}</span>
              </span>
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
