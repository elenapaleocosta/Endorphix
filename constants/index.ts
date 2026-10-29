import { palette } from "./palette";
import type { GeoPoint, MacroRealm, SportCategory } from "@/types";

export const Colors = palette;

export const MAX_RADIUS_KM = 50;
export const RADIUS_OPTIONS_KM = [10, 25, 50] as const;
export const SPARK_MIN_RATING = 4.5;
export const ENERGY_SCALE_MIN = 1;
export const ENERGY_SCALE_MAX = 100;

/** Used when the device location is unavailable (permission denied, timeout, unsupported). */
export const FALLBACK_LOCATION: GeoPoint = { latitude: 37.9838, longitude: 23.7275 };
export const FALLBACK_LOCATION_LABEL = "Athens";

export const BRAND_PHILOSOPHY =
  "The luxury of movement is a gift given to many that shall not be wasted. Running, jumping, and channeling energy throughout the body is the most effective way of getting to know yourself.";

export interface MacroRealmDefinition {
  id: MacroRealm;
  label: string;
  descriptor: string;
  accent: string;
}

export const MACRO_REALMS: MacroRealmDefinition[] = [
  { id: "water", label: "Water", descriptor: "Aquatic", accent: palette.camel },
  { id: "land", label: "Land", descriptor: "Court & track", accent: palette.olive },
  { id: "mountain", label: "Mountain", descriptor: "Vertical", accent: palette.terracotta },
];

export const REALM_BY_ID: Record<MacroRealm, MacroRealmDefinition> = {
  water: MACRO_REALMS[0],
  land: MACRO_REALMS[1],
  mountain: MACRO_REALMS[2],
};

export interface SportDefinition {
  id: Exclude<SportCategory, "other">;
  label: string;
  realm: MacroRealm;
  /** Conditioning index (0–100) used by the Passport's sport breakdown. */
  conditioning?: number;
}

export const SPORTS: SportDefinition[] = [
  { id: "football", label: "Football", realm: "land", conditioning: 94 },
  { id: "basketball", label: "Basketball", realm: "land", conditioning: 91 },
  { id: "volleyball", label: "Volleyball", realm: "land", conditioning: 84 },
  { id: "tennis", label: "Tennis", realm: "land", conditioning: 89 },
  { id: "padel", label: "Padel", realm: "land", conditioning: 82 },
  { id: "running", label: "Running", realm: "land", conditioning: 92 },
  { id: "cycling", label: "Cycling", realm: "land", conditioning: 90 },
  { id: "gym", label: "Athletic gym", realm: "land", conditioning: 85 },
  { id: "crossfit", label: "CrossFit", realm: "land", conditioning: 95 },
  { id: "boxing", label: "Boxing", realm: "land", conditioning: 95 },
  { id: "martial_arts", label: "Martial arts", realm: "land" },
  { id: "yoga", label: "Yoga", realm: "land", conditioning: 77 },
  { id: "pilates", label: "Pilates", realm: "land", conditioning: 79 },
  { id: "swimming", label: "Swimming", realm: "water", conditioning: 96 },
  { id: "rowing", label: "Rowing", realm: "water", conditioning: 94 },
  { id: "surfing", label: "Surfing", realm: "water", conditioning: 91 },
  { id: "sailing", label: "Sailing", realm: "water" },
  { id: "hiking", label: "Hiking", realm: "mountain", conditioning: 88 },
  { id: "climbing", label: "Climbing", realm: "mountain", conditioning: 93 },
  { id: "trail_running", label: "Trail running", realm: "mountain" },
];

export const SPORT_BY_ID = Object.fromEntries(SPORTS.map((s) => [s.id, s])) as Record<
  SportDefinition["id"],
  SportDefinition
>;
