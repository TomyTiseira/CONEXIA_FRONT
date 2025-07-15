'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/service/auth/authService';
import { MessageCircle, Bell, Menu, X, ChevronDown } from 'lucide-react';

export default function NavbarCommunity() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Conecta', href: '#conecta' },
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo sin redirección */}
        <div className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
          <span className="font-bold text-xl text-conexia-coral">CONEXIA</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6 font-semibold text-base text-conexia-green">
            {navItems.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5 text-conexia-green text-sm">
            <div className="flex items-center gap-1 cursor-pointer">
              <MessageCircle size={20} />
              <span>Mensajes</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <Bell size={20} />
              <span>Notificaciones</span>
            </div>
            {/* Perfil usuario */}
            <div
              className="relative flex items-center gap-1 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src="/yo.png"
                  alt="Perfil"
                  fill
                  className="object-cover"
                />
              </div>
              <ChevronDown size={16} />

              {menuOpen && (
                <div className="absolute right-0 top-12 w-36 bg-white border rounded shadow">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden p-2 text-conexia-green"
          aria-label="Toggle menu"
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileMenu && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 text-conexia-green font-medium bg-white shadow-inner">
          <ul className="flex flex-col gap-4 pt-2">
            {navItems.map(({ label, href }) => (
              <li key={label}>
                <a href={href} onClick={() => setMobileMenu(false)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex justify-around items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-1 text-sm">
              <MessageCircle size={18} />
              <span>Mensajes</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Bell size={18} />
              <span>Notificaciones</span>
            </div>
            <div
              className="relative flex items-center gap-1 text-sm cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src="/yo.png"
                  alt="Perfil"
                  fill
                  className="object-cover"
                />
              </div>
              <ChevronDown size={16} />

              {menuOpen && (
                <div className="absolute top-14 right-0 w-36 bg-white border rounded shadow">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
