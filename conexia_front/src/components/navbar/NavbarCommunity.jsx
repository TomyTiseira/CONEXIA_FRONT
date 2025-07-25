'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  MessageCircle,
  Bell,
  Home,
  Briefcase,
  Layers,
  ChevronDown,
} from 'lucide-react';
import DropdownUserMenu from '@/components/navbar/DropdownUserMenu';
import { useEffect } from 'react';
import { getProfileById } from '@/service/profiles/profilesFetch';

export default function NavbarCommunity() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();
  const userId = user?.id; 
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(userId);
        setProfile(data.data.profile);
      } catch (err) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [userId]);

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
    { label: 'Proyectos', href: '#proyectos', icon: Layers },
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      {/* Desktop Navbar */}
      <nav className="hidden md:flex justify-between items-center px-4 py-3 max-w-7xl mx-auto h-[64px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
          <span className="font-bold text-xl text-conexia-coral">CONEXIA</span>
        </Link>

        {/* Navigation */}
        <ul className="flex items-end gap-8 font-medium text-xs">
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
                {profile && profile.profilePicture ? (
                  <Image
                    src={`${require('@/config').config.IMAGE_URL}/${profile.profilePicture}`}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full" />
                )}
              </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && <DropdownUserMenu onLogout={handleLogout} />}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden flex justify-between items-center px-4 py-2 bg-white shadow h-[56px]">
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
          <span className="font-bold text-xl text-conexia-coral">CONEXIA</span>
        </Link>
        <div className="flex items-center gap-4 text-conexia-green">
          <MessageCircle size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <Bell size={20} className="cursor-pointer hover:text-conexia-green/80" />
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                {profile && profile.profilePicture ? (
                  <Image 
                    src={`${require('@/config').config.IMAGE_URL}/${profile.profilePicture}`} 
                    alt="Perfil" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && <DropdownUserMenu onLogout={handleLogout} />}
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
              className={`flex flex-col items-center text-xs ${
                isActive ? 'text-conexia-green font-semibold' : 'text-conexia-green/70'
              }`}
            >
              <Icon size={20} />
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