import { create } from "zustand";
import type { User } from "@/types";

const DEFAULT_ATHLETE: User = {
  id: "athlete-preview",
  email: "athlete@endorphix.luxury",
  username: "EndorphixAthlete",
  streak_current: 7,
  streak_longest: 21,
  lifetime_sessions: 42,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_ATHLETE,
  isAuthenticated: true,
  isLoading: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
}));
