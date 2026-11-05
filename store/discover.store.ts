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
  /** null clears the sport ("any sport"). */
  setSport: (sport: SportCategory | null) => void;
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
  setSport: (selectedSport) => set({ selectedSport }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTourPlan: (tourPlan) => set({ tourPlan }),
  clearFilters: () => set({ selectedRealm: null, selectedSport: null, radiusKm: MAX_RADIUS_KM }),
}));
