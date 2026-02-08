import { create } from 'zustand';

/**
 * Zustand store para coordinar visibilidad entre NEXO y la mensajería.
 * - Al abrir NEXO se cierra la mensajería y viceversa.
 */
export const useChatWidgetsStore = create((set, get) => ({
  nexoOpen: false,
  // Por defecto mostramos la mensajería y no NEXO
  messagingOpen: true,

  openNexo: () => set({ nexoOpen: true, messagingOpen: false }),
  closeNexo: () => set({ nexoOpen: false }),
  toggleNexo: () => set((s) => ({ nexoOpen: !s.nexoOpen, messagingOpen: s.nexoOpen ? s.messagingOpen : false })),

  openMessaging: () => set({ messagingOpen: true, nexoOpen: false }),
  closeMessaging: () => set({ messagingOpen: false }),
  toggleMessaging: () => set((s) => ({ messagingOpen: !s.messagingOpen, nexoOpen: s.messagingOpen ? s.nexoOpen : false })),
}));

export default useChatWidgetsStore;
