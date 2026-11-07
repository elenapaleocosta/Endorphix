import { create } from "zustand";
import { MAX_RADIUS_KM } from "@/constants";
import type { MacroRealm, SportCategory } from "@/types";

/** The trip the Travel tab last planned: what was submitted, not what is being typed. */
export interface TripRequest {
  destination: string;
  days: number;
}

/** Shared by the Discover tab (realm, sport, radius) and the Travel tab (destination, stay, trip). */
interface DiscoverState {
  selectedRealm: MacroRealm | null;
  selectedSport: SportCategory | null;
  radiusKm: number;
  destination: string;
  tourDays: number;
  trip: TripRequest | null;
  /** Selecting the active realm again clears it. Changing realm always clears the sport. */
  toggleRealm: (realm: MacroRealm) => void;
  /** null clears the sport ("any sport"). */
  setSport: (sport: SportCategory | null) => void;
  setRadiusKm: (radiusKm: number) => void;
  setDestination: (destination: string) => void;
  setTourDays: (days: number) => void;
  setTrip: (trip: TripRequest | null) => void;
  clearFilters: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  selectedRealm: null,
  selectedSport: null,
  radiusKm: MAX_RADIUS_KM,
  destination: "",
  tourDays: 3,
  trip: null,

  toggleRealm: (realm) =>
    set((state) => ({ selectedRealm: state.selectedRealm === realm ? null : realm, selectedSport: null })),
  setSport: (selectedSport) => set({ selectedSport }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTrip: (trip) => set({ trip }),
  clearFilters: () => set({ selectedRealm: null, selectedSport: null, radiusKm: MAX_RADIUS_KM }),
}));
