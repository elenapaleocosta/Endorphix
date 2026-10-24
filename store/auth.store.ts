import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/types";

const STORAGE_KEY_AUTH = "endorphix_auth_user";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const DEFAULT_ATHLETE: User = {
  id: "athlete-julian",
  email: "julian@endorphix.app",
  username: "julian_sterling",
  first_name: "Julian",
  last_name: "Sterling",
  nickname: "The Cadence",
  display_name: "Julian Sterling",
  bio: "Country club tennis competitor & high-cadence endurance cyclist. Channeling daily endorphins within 50km.",
  avatar_url: DEFAULT_AVATAR,
  streak_current: 9,
  streak_longest: 24,
  lifetime_sessions: 48,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export interface NotificationPreferences {
  pushNotifications: boolean;
  emailUpdates: boolean;
  activityAlerts: boolean;
  marketingMessages: boolean;
}

export interface PrivacyPreferences {
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

  setUser: (user) => {
    if (user) {
      AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  updateUserProfile: (updates) =>
    set((state) => {
      if (!state.user) return state;
      const updated: User = {
        ...state.user,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated)).catch(() => {});
      return { user: updated };
    }),

  setNotifications: (prefs) =>
    set((state) => ({
      notifications: { ...state.notifications, ...prefs },
    })),

  setPrivacy: (prefs) =>
    set((state) => ({
      privacy: { ...state.privacy, ...prefs },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: () => {
    AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
    set({ user: null, isAuthenticated: false });
  },

  deleteAccount: () => {
    AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
    set({ user: null, isAuthenticated: false });
  },
}));
