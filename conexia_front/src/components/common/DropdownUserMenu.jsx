'use client';

import { LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DropdownUserMenu({ onLogout }) {
    const router = useRouter();
    return (
        <div className="absolute right-0 top-12 w-56 bg-white border rounded shadow-md z-50 py-3 text-conexia-green">
        {/* Header del usuario */}
        <div className="px-4 py-3 flex items-center gap-3 border-b">
            <div className="w-12 h-12 relative rounded-full overflow-hidden">
            <Image src="/yo.png" alt="Usuario" fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
            <span className="font-semibold text-sm">Alex Paredes</span>
            <span className="text-xs text-conexia-green/80">Estudiante</span>
            <button
                className="mt-2 text-xs bg-conexia-green/80 text-white px-3 py-1 rounded-full hover:bg-conexia-green transition"
            >
                Ver perfil
            </button>
            </div>
        </div>

        {/* Opciones */}
        <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
            >
            <Settings size={16} />
            Configuraciones y privacidad
        </button>

        <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
        >
            <LogOut size={16} />
            Cerrar sesión
        </button>
        </div>
    );
    }
