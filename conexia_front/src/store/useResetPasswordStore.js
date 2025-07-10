import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useResetPasswordStore = create(
  persist(
    (set) => ({
      email: "",
      setEmail: (email) => set({ email }),
    }),
    {
      name: "reset-password-storage", // clave del localStorage
    }
  )
);
