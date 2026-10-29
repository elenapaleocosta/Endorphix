import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingState {
  hasCompletedFTUE: boolean;
  hydrated: boolean;
  markHydrated: () => void;
  completeFTUE: () => void;
  resetFTUE: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedFTUE: false,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      completeFTUE: () => set({ hasCompletedFTUE: true }),
      resetFTUE: () => set({ hasCompletedFTUE: false }),
    }),
    {
      name: "endorphix-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasCompletedFTUE }) => ({ hasCompletedFTUE }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
