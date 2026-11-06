import { create } from "zustand";
import { MAX_RADIUS_KM } from "@/constants";
import type { MacroRealm, SportCategory, TourPlan } from "@/types";

/** Shared by the Discover tab (realm, sport, radius) and the Travel tab (destination, stay, plan). */
interface DiscoverState {
  selectedRealm: MacroRealm | null;
  selectedSport: SportCategory | null;
  radiusKm: number;
  destination: string;
  tourDays: number;
  tourPlan: TourPlan | null;
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
  selectedRealm: null,
  selectedSport: null,
  radiusKm: MAX_RADIUS_KM,
  destination: "",
  tourDays: 3,
  tourPlan: null,

  toggleRealm: (realm) =>
    set((state) => ({ selectedRealm: state.selectedRealm === realm ? null : realm, selectedSport: null })),
  setSport: (selectedSport) => set({ selectedSport }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTourPlan: (tourPlan) => set({ tourPlan }),
  clearFilters: () => set({ selectedRealm: null, selectedSport: null, radiusKm: MAX_RADIUS_KM }),
}));
