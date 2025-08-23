'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  MessageCircle,
  AlertTriangle,
  Bell,
  Home,
  Briefcase,
  Layers,
  ChevronDown,
  Users,
} from 'lucide-react';
import DropdownInternalUserMenu from '@/components/navbar/DropdownInternalUserMenu';
import { config } from '@/config';

export default function NavbarAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Servicios', href: '#servicios', icon: Briefcase },
  { label: 'Proyectos', href: '/project/search', icon: Layers },
  { label: 'Reportes', href: '/reports', icon: AlertTriangle },
  { label: 'Usuarios', href: '/admin/internal-users', icon: Users },
  ];

  const defaultAvatar = '/images/default-avatar.png';

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      {/* Desktop Navbar */}
      <nav className="hidden md:flex justify-between items-center px-4 py-3 max-w-7xl mx-auto h-[64px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
        </Link>

        {/* Navigation */}
        <ul className="flex items-end gap-6 font-medium text-xs">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={label}>
                <Link
                  href={href}
                  className="flex flex-col items-center relative group cursor-pointer"
                >
                  <Icon
                    size={18}
                    className={`mb-1 transition-colors ${
                      isActive ? 'text-conexia-green' : 'text-conexia-green/70'
                    } group-hover:text-conexia-green`}
                  />
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-conexia-green font-semibold' : 'text-conexia-green/70'
                    } group-hover:text-conexia-green`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-[6px] h-[2px] w-full bg-conexia-green rounded"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4 text-conexia-green">
          <MessageCircle size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <Bell size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image
                  src={
                    (user?.role === 'admin' || user?.role === 'moderator') 
                      ? defaultAvatar
                      : (user && user.profilePicture
                        ? `${config.IMAGE_URL}/${user.profilePicture}`
                        : defaultAvatar)
                  }
                  alt="Foto de perfil"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && (
              <DropdownInternalUserMenu
                onLogout={handleLogout}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden flex justify-between items-center px-4 py-2 bg-white shadow h-[56px]">
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
        </Link>
        <div className="flex items-center gap-4 text-conexia-green">
          <MessageCircle size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <Bell size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image
                  src={
                    (user?.role === 'admin' || user?.role === 'moderator') 
                      ? defaultAvatar
                      : (user && user.profilePicture
                        ? `${config.IMAGE_URL}/${user.profilePicture}`
                        : defaultAvatar)
                  }
                  alt="Foto de perfil"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && (
              <DropdownInternalUserMenu
                onLogout={handleLogout}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md border-t flex justify-around py-2 z-40">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center text-[11px] ${
                isActive ? 'text-conexia-green font-semibold' : 'text-conexia-green/70'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && (
                <span className="mt-[2px] h-[2px] w-4 bg-conexia-green rounded"></span>
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
