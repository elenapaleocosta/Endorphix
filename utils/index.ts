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
  { min: 90, label: "Peak vitality high", description: "Transcendent neuromuscular flow and a full endorphin flush.", color: Colors.highlight },
  { min: 75, label: "High euphoric flow", description: "Elevated clarity and buoyant lightness.", color: Colors.accent },
  { min: 50, label: "Active flow state", description: "Clean baseline activation, centred cadence.", color: Colors.tint },
  { min: 25, label: "Grounded & resetting", description: "Subdued state while tissue conditions.", color: Colors.fgMuted },
  { min: 1, label: "Somatic depletion", description: "Replenish, hydrate and recover.", color: Colors.fgMuted },
];

export function energyBand(score: number): EnergyBand {
  return ENERGY_BANDS.find((band) => score >= band.min) ?? ENERGY_BANDS[ENERGY_BANDS.length - 1];
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

function hslToHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return rgbToHex([f(0), f(8), f(4)]);
}

/** Opaque blend of `color` over `base` (no alpha, so the contour backdrop never shows through). */
function blend(color: string, base: string, amount: number) {
  const c = hexToRgb(color);
  const b = hexToRgb(base);
  return rgbToHex(c.map((v, i) => b[i] + (v - b[i]) * amount));
}

export interface ScoreTone {
  fg: string;
  bg: string;
  border: string;
}

/** Bends the score → hue curve so only the very top reads fully green and everything lower leans red. */
const SCORE_HUE_CURVE = 3.5;

/**
 * Endorphin score (1–100) on a red → amber → green scale, for score badges. The hue runs 0° → 130° along a
 * curve, not a straight line: most scores here sit in the 80s and 90s, and a straight line paints 88 and 99
 * the same green. With the curve, 99 ≈ 126° (green), 95 ≈ 109°, 88 ≈ 83° (yellow-lime), 75 ≈ 47° (amber),
 * 65 ≈ 29° (orange) and 50 or below is red. The text colour stays above 4.5:1 on its own faint tint at every score, and the
 * number is always shown, so colour is never the only signal.
 */
export function scoreTone(score: number): ScoreTone {
  const t = Math.min(100, Math.max(0, score)) / 100;
  const fg = hslToHex(t ** SCORE_HUE_CURVE * 130, 0.7, 0.76);
  return { fg, bg: blend(fg, Colors.surface, 0.12), border: blend(fg, Colors.surface, 0.4) };
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
