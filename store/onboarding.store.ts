import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FTUE_KEY = "@endorphix/ftue_completed";

interface OnboardingState {
  hasCompletedFTUE: boolean;
  currentSlide: number;
  isLoading: boolean;
  checkFTUE: () => Promise<void>;
  completeFTUE: () => Promise<void>;
  setSlide: (index: number) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedFTUE: false,
  currentSlide: 0,
  isLoading: true,

  checkFTUE: async () => {
    try {
      const value = await AsyncStorage.getItem(FTUE_KEY);
      set({ hasCompletedFTUE: value === "true", isLoading: false });
    } catch {
      set({ hasCompletedFTUE: false, isLoading: false });
    }
  },

  completeFTUE: async () => {
    try {
      await AsyncStorage.setItem(FTUE_KEY, "true");
      set({ hasCompletedFTUE: true });
    } catch (e) {
      console.error("[Onboarding] Failed to persist FTUE state:", e);
    }
  },

  setSlide: (currentSlide) => set({ currentSlide }),
}));
