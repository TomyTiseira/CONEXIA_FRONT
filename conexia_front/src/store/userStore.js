import { create } from 'zustand';
import { ROLES } from '@/constants/roles';

export const useUserStore = create((set) => ({
  user: null, // datos básicos (id, email, roleId, etc)
  roleId: null,
  roleName: null,
  profile: null, // datos extendidos (foto, nombre, ciudad, etc)
  setUser: (user, roleName = null) => set({ user, roleId: user?.roleId || null, roleName }),
  setProfile: (profile) => set({ profile }),
  setRoleName: (roleName) => set({ roleName }),
  clearUser: () => set({ user: null, roleId: null, roleName: null, profile: null }),
}));

// Uso:
// const { user, role, setUser, setRole, clearUser } = useUserStore();
// setUser({ ...userData, role: 'admin' })
// clearUser() al cerrar sesión
