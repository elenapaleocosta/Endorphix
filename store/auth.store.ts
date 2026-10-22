import { create } from "zustand";
import type { User } from "@/types";

const DEFAULT_ATHLETE: User = {
  id: "athlete-preview",
  email: "athlete@endorphix.luxury",
  username: "EndorphixAthlete",
  display_name: "Alex Vance",
  bio: "Endurance cyclist & somatic vitality seeker. Building high-cadence momentum daily.",
  avatar_url: "",
  streak_current: 7,
  streak_longest: 21,
  lifetime_sessions: 42,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface NotificationPreferences {
  pushNotifications: boolean;
  emailUpdates: boolean;
  activityAlerts: boolean;
  marketingMessages: boolean;
}

interface PrivacyPreferences {
  profileVisibility: "public" | "private";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  setUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setNotifications: (prefs: Partial<NotificationPreferences>) => void;
  setPrivacy: (prefs: Partial<PrivacyPreferences>) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  deleteAccount: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_ATHLETE,
  isAuthenticated: true,
  isLoading: false,
  notifications: {
    pushNotifications: true,
    emailUpdates: false,
    activityAlerts: true,
    marketingMessages: false,
  },
  privacy: {
    profileVisibility: "public",
  },

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  updateUserProfile: (updates) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, ...updates, updated_at: new Date().toISOString() }
        : null,
    })),

  setNotifications: (prefs) =>
    set((state) => ({
      notifications: { ...state.notifications, ...prefs },
    })),

  setPrivacy: (prefs) =>
    set((state) => ({
      privacy: { ...state.privacy, ...prefs },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),

  deleteAccount: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
}));
