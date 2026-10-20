import { create } from "zustand";
import type { GeoPoint } from "@/types";

interface LocationState {
  userLocation: GeoPoint | null;
  locationPermission: "undetermined" | "granted" | "denied";
  isLoadingLocation: boolean;
  setUserLocation: (location: GeoPoint | null) => void;
  setLocationPermission: (status: LocationState["locationPermission"]) => void;
  setLoadingLocation: (loading: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  locationPermission: "undetermined",
  isLoadingLocation: false,

  setUserLocation: (userLocation) => set({ userLocation }),
  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setLoadingLocation: (isLoadingLocation) => set({ isLoadingLocation }),
}));
