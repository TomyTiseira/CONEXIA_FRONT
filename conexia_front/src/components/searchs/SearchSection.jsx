import React from 'react';

export default function SearchSection({
  title,
  description,
  showAll,
  onToggleShowAll,
  showToggle,
  showContent,
  onToggleContent,
  children,
  toggleLabel = 'Ver todos',
  icon: Icon,
  headerActions,
}) {
  // Ajustar margen inferior dinámicamente según si hay contenido visible
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-6 py-3 mb-0 gap-2 md:gap-0" style={{ minHeight: 48, marginBottom: showContent ? 8 : 0 }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={24} className="text-conexia-green/80" />}
          <div>
            <span className="text-conexia-green text-xl font-bold block" style={{lineHeight:'1.1'}}>{title}</span>
            <span className="text-conexia-green/90 font-medium block text-sm mt-1">{description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:ml-4">
          {showToggle && (
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition border border-conexia-green/20 bg-conexia-green/10 text-conexia-green/80 hover:bg-conexia-green/20"
              onClick={onToggleShowAll}
            >
              {showAll && <span className="text-lg"></span>} {toggleLabel}
            </button>
          )}
          {headerActions}
        </div>
      </div>
      {showContent && (
        <div className="bg-[#f3f7f6] rounded-2xl shadow-xl border-2 border-conexia-green/20 p-4 flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
}
