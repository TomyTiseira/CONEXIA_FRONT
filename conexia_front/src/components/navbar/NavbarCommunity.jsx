'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { HiUserGroup } from 'react-icons/hi';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import DropdownUserMenu from '@/components/navbar/DropdownUserMenu';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import GlobalSearchBar from '@/components/common/GlobalSearchBar';
import { useMessaging } from '@/hooks/messaging/useMessaging'; // ya importado
import { getMessagingSocket } from '@/lib/socket/messagingSocket'; // <- NUEVO

export default function NavbarCommunity() {
  const { count: connectionRequestsCount } = useConnectionRequests();
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const defaultAvatar = '/images/default-avatar.png';
  const { unreadCount, refreshUnreadCount, chats, loadConversations } = useMessaging();
  // Total de mensajes sin leer (suma por conversación)
  const totalUnread = useMemo(() => {
    try {
      return (Array.isArray(chats) ? chats : []).reduce((acc, c) => acc + Number(c?.unreadCount || 0), 0);
    } catch { return 0; }
  }, [chats]);
  // Ajuste visual para hasta 3 dígitos (usar totalUnread para el badge)
  const displayUnread = Math.min(Number(totalUnread || 0), 999);
  const unreadLen = String(displayUnread).length;
  const desktopBadgeText = unreadLen >= 3 ? 'text-[9px]' : 'text-[10px]';
  const mobileBadgeText = unreadLen >= 3 ? 'text-[8px]' : 'text-[9px]';

  useEffect(() => {
    // Cargar al montar: contador y conversaciones para tener suma completa
    refreshUnreadCount();
    loadConversations({ page: 1, limit: 50, append: false });

    // Suscribirse a sockets: refrescar lista (para actualizar unread por conv) y contador API como respaldo
    const socket = getMessagingSocket();
    let ticking = false;
    const doRefresh = () => {
      if (ticking) return; ticking = true;
      Promise.resolve()
        .then(() => {
          loadConversations({ page: 1, limit: 50, append: false });
          refreshUnreadCount();
        })
        .finally(() => setTimeout(() => { ticking = false; }, 300));
    };
    socket?.on?.('connect', doRefresh);
    socket?.on?.('reconnect', doRefresh);
    socket?.on?.('newMessage', doRefresh);
    socket?.on?.('messageNotification', doRefresh);
    socket?.on?.('messagesRead', doRefresh);
    return () => {
      socket?.off?.('connect', doRefresh);
      socket?.off?.('reconnect', doRefresh);
      socket?.off?.('newMessage', doRefresh);
      socket?.off?.('messageNotification', doRefresh);
      socket?.off?.('messagesRead', doRefresh);
    };
  }, [refreshUnreadCount, loadConversations]);

  useEffect(() => {
    // Refrescar al volver a la pestaña (fallback)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshUnreadCount();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshUnreadCount]);

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
    { label: 'Servicios', href: '/services', icon: Briefcase },
    { label: 'Proyectos', href: "/project/search", icon: Layers },
    { label: 'Conexiones', href: '/connections', icon: HiUserGroup, showDot: connectionRequestsCount > 0 },
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      {/* Desktop Navbar */}
  <nav className="hidden md:flex items-center px-4 py-3 max-w-7xl mx-auto h-[64px] relative">

        {/* Logo a la izquierda */}
  <div className="flex items-center min-w-0 flex-1 gap-2 z-10 order-1">
          <Link href="/" className="flex items-center select-none">
            <Image src="/logo.png" alt="Conexia" width={30} height={30} />
          </Link>
          {/* Search: allow shrink so center area keeps room */}
          <div className="flex items-center h-full min-w-0 flex-1">
            <GlobalSearchBar className="w-full min-w-[120px] sm:min-w-[200px] lg:min-w-[280px] max-w-[520px]" />
          </div>
        </div>

        {/* Center menu: centered on xl, shifts left on md/lg */}
        <div className="order-2 mx-2 w-max xl:absolute xl:left-1/2 xl:-translate-x-1/2 xl:top-1/2 xl:-translate-y-1/2 relative z-20">
          <ul className="flex items-end gap-0 font-medium text-xs">
            {navItems.map(({ label, href, icon: Icon, showDot }) => {
              const isActive = pathname === href;
              return (
                <li key={label} className="relative px-3">
                  <Link
                    href={href}
                      className="flex flex-col items-center relative group cursor-pointer min-w-[36px] lg:min-w-[64px] justify-center"
                  >
                    <span className="relative">
                      <Icon
                        size={18}
                        className={`mb-1 transition-colors ${
                          isActive ? 'text-conexia-green' : 'text-conexia-green/70'
                        } group-hover:text-conexia-green`}
                      />
                      {showDot && (
                        <span className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-[#ff4953] border-2 border-white" />
                      )}
                    </span>
                      <span
                      className={`transition-colors ${
                          isActive ? 'text-conexia-green font-semibold' : 'text-conexia-green/70'
                        } group-hover:text-conexia-green`}
                    >
                      {label}
                    </span>
                    {isActive && (
                        <span className="absolute -bottom-[6px] h-[2px] w-4 xl:w-full bg-conexia-green rounded" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right cluster: actions (message, bell, avatar) */}
  <div className="flex items-center gap-4 text-conexia-green min-w-0 flex-1 justify-end order-3">
          <div className="relative">
            <Link href="/messaging" prefetch={false} className="block">
              <MessageCircle size={20} className="hover:text-conexia-green/80" />
            </Link>
            {displayUnread > 0 && (
              <span className={`absolute -top-1 -right-2 min-w-[20px] h-[16px] px-1 rounded-full bg-[#e6424b] text-white leading-[16px] text-center ${desktopBadgeText}`}>
                {displayUnread}
              </span>
            )}
          </div>
          <div className="relative">
            <Link href="/notifications" prefetch={false} className="block">
              <Bell size={20} className="hover:text-conexia-green/80" />
            </Link>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image
                  src={
                    profile && profile.profilePicture
                      ? `${config.IMAGE_URL}/${profile.profilePicture}`
                      : defaultAvatar
                  }
                  alt="Foto de perfil"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && <DropdownUserMenu onLogout={handleLogout} onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
  <nav className="md:hidden flex justify-between items-center px-4 py-2 bg-white shadow h-[56px]">
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
        </Link>
        <div className="flex items-center gap-4 text-conexia-green">
          <div className="relative">
            <Link href="/messaging" prefetch={false} className="block">
              <MessageCircle
                size={20}
                className="cursor-pointer hover:text-conexia-green/80"
              />
            </Link>
            {displayUnread > 0 && (
              <span className={`absolute -top-1 -right-2 min-w-[20px] h-[16px] px-1 rounded-full bg-[#e6424b] text-white leading-[16px] text-center ${mobileBadgeText}`}>
                {displayUnread}
              </span>
            )}
          </div>
          <Link href="/notifications" prefetch={false} className="block">
            <Bell size={20} className="cursor-pointer hover:text-conexia-green/80" />
          </Link>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <Image
                    src={
                      profile && profile.profilePicture
                        ? `${config.IMAGE_URL}/${profile.profilePicture}`
                        : defaultAvatar
                    }
                    alt="Foto de perfil"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              <ChevronDown size={16} />
            </button>
            {menuOpen && <DropdownUserMenu onLogout={handleLogout} onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md border-t flex justify-around py-2 z-40">
        {navItems.map(({ label, href, icon: Icon, showDot }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center text-xs relative ${
                isActive ? 'text-conexia-green font-semibold' : 'text-conexia-green/70'
              }`}
            >
              <span className="relative">
                <Icon size={20} />
                {showDot && (
                  <span className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-[#ff4953] border-2 border-white flex items-center justify-center"></span>
                )}
              </span>
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
