import { create } from "zustand";
import { MAX_RADIUS_KM } from "@/constants";
import type { MacroRealm, SearchMode, SportCategory, TourPlan } from "@/types";

interface DiscoverState {
  searchMode: SearchMode;
  selectedRealm: MacroRealm | null;
  selectedSport: SportCategory | null;
  radiusKm: number;
  destination: string;
  tourDays: number;
  tourPlan: TourPlan | null;
  setSearchMode: (mode: SearchMode) => void;
  /** Selecting the active realm again clears it. Changing realm always clears the sport. */
  toggleRealm: (realm: MacroRealm) => void;
  /** Selecting the active sport again clears it. */
  toggleSport: (sport: SportCategory) => void;
  setRadiusKm: (radiusKm: number) => void;
  setDestination: (destination: string) => void;
  setTourDays: (days: number) => void;
  setTourPlan: (plan: TourPlan | null) => void;
  clearFilters: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  searchMode: "sport-first",
  selectedRealm: null,
  selectedSport: null,
  radiusKm: MAX_RADIUS_KM,
  destination: "",
  tourDays: 3,
  tourPlan: null,

  setSearchMode: (searchMode) => set({ searchMode }),
  toggleRealm: (realm) =>
    set((state) => ({ selectedRealm: state.selectedRealm === realm ? null : realm, selectedSport: null })),
  toggleSport: (sport) => set((state) => ({ selectedSport: state.selectedSport === sport ? null : sport })),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTourPlan: (tourPlan) => set({ tourPlan }),
  clearFilters: () => set({ selectedRealm: null, selectedSport: null, radiusKm: MAX_RADIUS_KM }),
}));
