import { create } from "zustand";
import type { SearchMode, SportCategory, MacroRealm } from "@/types";

interface DiscoverState {
  searchMode: SearchMode;
  selectedRealm: MacroRealm | null;
  selectedSport: SportCategory | null;
  radiusKm: number;
  destination: string;
  tourDays: number;
  tourRealms: MacroRealm[];
  setSearchMode: (mode: SearchMode) => void;
  setSelectedRealm: (realm: MacroRealm | null) => void;
  setSelectedSport: (sport: SportCategory | null) => void;
  setRadiusKm: (radiusKm: number) => void;
  setDestination: (destination: string) => void;
  setTourDays: (days: number) => void;
  setTourRealms: (realms: MacroRealm[]) => void;
  resetDiscover: () => void;
}

const initialState = {
  searchMode: "sport-first" as SearchMode,
  selectedRealm: null as MacroRealm | null,
  selectedSport: null as SportCategory | null,
  radiusKm: 50,
  destination: "St. Moritz & Engadin Valley",
  tourDays: 3,
  tourRealms: ["land", "water", "mountain"] as MacroRealm[],
};

export const useDiscoverStore = create<DiscoverState>((set) => ({
  ...initialState,

  setSearchMode: (searchMode) => set({ searchMode }),
  setSelectedRealm: (selectedRealm) => set({ selectedRealm, selectedSport: null }),
  setSelectedSport: (selectedSport) => set({ selectedSport }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTourRealms: (tourRealms) => set({ tourRealms }),
  resetDiscover: () => set(initialState),
}));
