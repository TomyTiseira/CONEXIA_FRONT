// components/ui/BackButton.jsx
'use client';

import clsx from 'clsx';

export default function BackButton({
  onClick,
  text = 'Atrás',
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded font-semibold focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm border border-[#c6e3e4] bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0]',
        className
      )}
      {...props}
    >
      <svg
        className="w-5 h-5 text-conexia-green"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="6.5"
          y1="10"
          x2="13.5"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="9,7 6,10 9,13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-conexia-green">{text}</span>
    </button>
  );
}
