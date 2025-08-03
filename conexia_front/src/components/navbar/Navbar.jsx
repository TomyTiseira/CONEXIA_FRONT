// src/components/navbar/Navbar.jsx
'use client';

import { useUserStore } from '@/store/userStore';
import NavbarAdmin from './NavbarAdmin';
import NavbarModerator from './NavbarModerator';
import NavbarCommunity from './NavbarCommunity';
import { ROLES } from '@/constants/roles';

export default function Navbar() {
  const { roleName } = useUserStore();

  if (roleName === ROLES.ADMIN) return <NavbarAdmin />;
  if (roleName === ROLES.MODERATOR) return <NavbarModerator />;
  // Por defecto, usuario normal
  return <NavbarCommunity />;
}
