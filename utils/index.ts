import { Colors, SPORT_BY_ID } from "@/constants";
import type { ActivityType, FacilityTimetable, SportCategory } from "@/types";

export interface EnergyBand {
  min: number;
  label: string;
  description: string;
  color: string;
}

/** The Endorphin Bar scale (see platform dossier §3). Ordered high → low. */
export const ENERGY_BANDS: EnergyBand[] = [
  { min: 90, label: "Peak vitality high", description: "Transcendent neuromuscular flow and a full endorphin flush.", color: Colors.terracotta },
  { min: 75, label: "High euphoric flow", description: "Elevated clarity and buoyant lightness.", color: Colors.olive },
  { min: 50, label: "Active flow state", description: "Clean baseline activation, centred cadence.", color: Colors.camel },
  { min: 25, label: "Grounded & resetting", description: "Subdued state while tissue conditions.", color: Colors.inkMuted },
  { min: 1, label: "Somatic depletion", description: "Replenish, hydrate and recover.", color: Colors.inkMuted },
];

export function energyBand(score: number): EnergyBand {
  return ENERGY_BANDS.find((band) => score >= band.min) ?? ENERGY_BANDS[ENERGY_BANDS.length - 1];
}

export function formatDistance(meters?: number): string | null {
  if (meters === undefined) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function sportLabel(sport: SportCategory): string {
  return sport === "other" ? "Other" : SPORT_BY_ID[sport]?.label ?? sport;
}

const ACTIVITY_BY_SPORT: Partial<Record<SportCategory, ActivityType>> = {
  tennis: "tennis",
  padel: "court",
  running: "run",
  trail_running: "run",
  cycling: "cycle",
  swimming: "swim",
  climbing: "climb",
  hiking: "hike",
  football: "soccer",
  basketball: "basketball",
  gym: "lift",
  crossfit: "lift",
  yoga: "yoga",
  pilates: "yoga",
};

export function sportToActivityType(sport: SportCategory): ActivityType {
  return ACTIVITY_BY_SPORT[sport] ?? "other";
}

/** Local calendar date as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Today", "Yesterday", "3 days ago", or a short date for anything older than a week. */
export function formatSessionDay(isoDate: string): string {
  const day = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return day.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function todayKey(): keyof FacilityTimetable {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as keyof FacilityTimetable;
}
