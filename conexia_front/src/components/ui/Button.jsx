// components/ui/Button.jsx
'use client';

import clsx from 'clsx';

export default function Button({
    children,
    type = 'button',
    onClick,
    className = '',
    variant = 'primary', // 'primary' | 'secondary' | 'neutral' | 'informative' | 'danger' | 'success'
    loading,
    ...props
    }) {
    const baseStyles =
        'rounded font-semibold focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm';

    const variants = {
        primary: 'bg-conexia-green text-white hover:bg-conexia-green/90',
        secondary: 'bg-[#ff4953] text-white hover:bg-[#f36970ff]',
        neutral: 'bg-[#367d7d] text-white hover:bg-[#2b6a6a]',
        informative: 'bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0]',
        delete:'bg-red-200 text-red-800 hover:bg-red-300 focus:ring-red-300',
        edit:'bg-[#e4f1f1] text-conexia-green hover:bg-[#d6ebeb]',
        add:'bg-[#cde6e6] text-conexia-green hover:bg-[#b9dddd]',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-conexia-green text-white hover:bg-conexia-green/80 focus:ring-conexia-green/50',
        cancel: 'bg-[#f5f6f6] text-[#777d7d] hover:bg-[#f1f2f2] border border-[#e1e4e4]',
        back: 'bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] border border-[#c6e3e4]',
        // Custom variant for "Conectar" button (teal background, white text)
        connect: 'bg-[#388181ff] text-white hover:bg-[#1f6363ff]',
    };

    // No pasar 'loading' al DOM
    const { ...restProps } = props;
    return (
        <button
        type={type}
        onClick={onClick}
        className={clsx(baseStyles, variants[variant], className)}
        {...restProps}
        >
        {children}
        </button>
    );
    }
