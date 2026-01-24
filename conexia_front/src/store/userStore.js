import { create } from 'zustand';
import { ROLES } from '@/constants/roles';

export const useUserStore = create((set) => ({
  user: null, // datos básicos (id, email, roleId, etc)
  roleId: null,
  roleName: null,
  profile: null, // datos extendidos (foto, nombre, ciudad, etc)
  
  // Estado de cuenta (suspensión/baneo)
  accountStatus: 'active', // 'active' | 'suspended' | 'banned'
  isSuspended: false,
  isBanned: false,
  suspensionExpiresAt: null,
  suspensionReason: null,
  
  setUser: (user, roleName = null) => set({ 
    user, 
    roleId: user?.roleId || null, 
    roleName,
    // Extraer estado de cuenta
    accountStatus: user?.accountStatus || 'active',
    isSuspended: user?.accountStatus === 'suspended',
    isBanned: user?.accountStatus === 'banned',
    suspensionExpiresAt: user?.suspensionExpiresAt || null,
    suspensionReason: user?.suspensionReason || null,
  }),
  setProfile: (profile) => set({ profile }),
  setRoleName: (roleName) => set({ roleName }),
  clearUser: () => set({ 
    user: null, 
    roleId: null, 
    roleName: null, 
    profile: null,
    accountStatus: 'active',
    isSuspended: false,
    isBanned: false,
    suspensionExpiresAt: null,
    suspensionReason: null,
  }),
}));

// Uso:
// const { user, role, setUser, setRole, clearUser } = useUserStore();
// setUser({ ...userData, role: 'admin' })
// clearUser() al cerrar sesión
