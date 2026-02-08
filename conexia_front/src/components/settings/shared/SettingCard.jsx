'use client';

export default function SettingCard({ title, description, onClick, buttonLabel }) {
  return (
    <div className="px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
      <div>
        <p className="font-medium text-conexia-green">{title}</p>
        <p className="text-conexia-green/80 text-sm mb-2 md:mb-0">{description}</p>
      </div>
      {buttonLabel && onClick && (
        <button
          onClick={onClick}
          className="bg-conexia-green text-white px-3 py-1.5 rounded text-sm hover:bg-conexia-green/90 md:ml-8"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
