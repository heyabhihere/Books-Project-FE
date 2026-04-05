import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  email: string;
  name?: string;
  gender?: number;
  DOB?: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  pendingEmail: string | null;
  resetToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setPendingEmail: (email: string) => void;
  setResetToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      pendingEmail: null,
      resetToken: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, pendingEmail: null }),
      setPendingEmail: (email) => set({ pendingEmail: email }),
      setResetToken: (token) => set({ resetToken: token }),
      setUser: (user) => set((state) => ({ ...state, user })),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingEmail: null,
          resetToken: null,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
