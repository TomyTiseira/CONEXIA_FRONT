import { create } from 'zustand';
import { ROLES } from '@/constants/roles';

export const useUserStore = create((set) => ({
  user: null,
  roleId: null,
  roleName: null,
  setUser: (user, roleName = null) => set({ user, roleId: user?.roleId || null, roleName }),
  setRoleName: (roleName) => set({ roleName }),
  clearUser: () => set({ user: null, roleId: null, roleName: null }),
}));

// Uso:
// const { user, role, setUser, setRole, clearUser } = useUserStore();
// setUser({ ...userData, role: 'admin' })
// clearUser() al cerrar sesión
