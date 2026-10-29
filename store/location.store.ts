import { create } from "zustand";
import type { GeoPoint } from "@/types";

export type LocationStatus = "pending" | "granted" | "fallback";

interface LocationState {
  userLocation: GeoPoint | null;
  /** "fallback" means the device location was unavailable and FALLBACK_LOCATION is in use. */
  status: LocationStatus;
  setLocation: (location: GeoPoint, status: Exclude<LocationStatus, "pending">) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  status: "pending",
  setLocation: (userLocation, status) => set({ userLocation, status }),
}));
