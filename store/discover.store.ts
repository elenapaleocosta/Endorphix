import { create } from "zustand";
import type { SearchMode, SportCategory } from "@/types";

interface DiscoverState {
  searchMode: SearchMode;
  selectedSport: SportCategory | null;
  destination: string;
  tourDays: number;
  tourPreferences: SportCategory[];
  setSearchMode: (mode: SearchMode) => void;
  setSelectedSport: (sport: SportCategory | null) => void;
  setDestination: (destination: string) => void;
  setTourDays: (days: number) => void;
  setTourPreferences: (prefs: SportCategory[]) => void;
  resetDiscover: () => void;
}

const initialState = {
  searchMode: "sport-first" as SearchMode,
  selectedSport: null,
  destination: "",
  tourDays: 3,
  tourPreferences: [] as SportCategory[],
};

export const useDiscoverStore = create<DiscoverState>((set) => ({
  ...initialState,

  setSearchMode: (searchMode) => set({ searchMode }),
  setSelectedSport: (selectedSport) => set({ selectedSport }),
  setDestination: (destination) => set({ destination }),
  setTourDays: (tourDays) => set({ tourDays }),
  setTourPreferences: (tourPreferences) => set({ tourPreferences }),
  resetDiscover: () => set(initialState),
}));
