'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsHeader({ onToggleMenu }) {
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => router.push('/community')}
      >
        <Image src="/logo.png" alt="Conexia" width={32} height={32} />
        <span className="text-conexia-green font-semibold text-xl">Configuraciones</span>
      </div>

      {/* Icono hamburguesa solo en mobile */}
      <button
        onClick={onToggleMenu}
        className="block md:hidden text-conexia-green"
        aria-label="Abrir menú de configuración"
      >
        <Menu size={24} />
      </button>
    </header>
  );
}

