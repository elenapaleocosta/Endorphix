import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/types";

export const DEMO_ATHLETE: User = {
  id: "athlete-julian",
  email: "julian@endorphix.app",
  username: "julian_sterling",
  first_name: "Julian",
  last_name: "Sterling",
  nickname: "The Cadence",
  display_name: "Julian Sterling",
  bio: "Country club tennis competitor and high-cadence endurance cyclist.",
  streak_current: 9,
  streak_longest: 24,
  lifetime_sessions: 48,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export interface NotificationPreferences {
  activityAlerts: boolean;
  pushNotifications: boolean;
  emailUpdates: boolean;
  marketingMessages: boolean;
}

export type ProfileVisibility = "public" | "private";

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  activityAlerts: true,
  pushNotifications: true,
  emailUpdates: false,
  marketingMessages: false,
};

interface AuthState {
  user: User | null;
  notifications: NotificationPreferences;
  profileVisibility: ProfileVisibility;
  /** True once persisted state has been read from storage. */
  hydrated: boolean;
  markHydrated: () => void;
  setUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setNotification: (key: keyof NotificationPreferences, value: boolean) => void;
  setProfileVisibility: (visibility: ProfileVisibility) => void;
  signOut: () => void;
  /** Signs out and restores every preference to its default. */
  eraseAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      notifications: DEFAULT_NOTIFICATIONS,
      profileVisibility: "public",
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),

      setUser: (user) => set({ user }),

      updateUserProfile: (updates) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...updates, updated_at: new Date().toISOString() } } : state,
        ),

      setNotification: (key, value) =>
        set((state) => ({ notifications: { ...state.notifications, [key]: value } })),

      setProfileVisibility: (profileVisibility) => set({ profileVisibility }),

      signOut: () => set({ user: null }),
      eraseAll: () => set({ user: null, notifications: DEFAULT_NOTIFICATIONS, profileVisibility: "public" }),
    }),
    {
      name: "endorphix-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ user, notifications, profileVisibility }) => ({ user, notifications, profileVisibility }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
