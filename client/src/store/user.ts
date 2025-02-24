import { AuthResponse, User } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateProfile: (user: User) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions   
      login: (response: AuthResponse) =>
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateProfile: (user: User) =>
        set({
          user: {
            ...user,
          },
        }),
    }),
    {
      name: 'user-storage', // name for local storage 
    }
  )
);
