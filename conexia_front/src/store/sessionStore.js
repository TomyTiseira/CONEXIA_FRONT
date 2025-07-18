import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  sessionVersion: 0,
  triggerSessionUpdate: () =>
    set((state) => ({ sessionVersion: state.sessionVersion + 1 })),
}));
