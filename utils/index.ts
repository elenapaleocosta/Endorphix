import { Colors } from "@/constants";
import type { FacilityTimetable } from "@/types";

/** Returns the open/close string for today, or null if closed. */
export function getTodayHours(timetable: FacilityTimetable): string | null {
  const day = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as keyof FacilityTimetable;

  const slot = timetable[day];
  if (!slot) return null;
  return `${slot.open} – ${slot.close}`;
}

/** Returns true if a facility is currently within open hours. */
export function isFacilityOpenNow(timetable: FacilityTimetable): boolean {
  const day = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as keyof FacilityTimetable;

  const slot = timetable[day];
  if (!slot) return false;

  const now = new Date();
  const [openH, openM] = slot.open.split(":").map(Number);
  const [closeH, closeM] = slot.close.split(":").map(Number);

  const openMinutes  = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const nowMinutes   = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
}

/** Formats a distance in meters to a human-readable string. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** Maps energy score (1-100) to a semantic label. */
export function energyLabel(score: number): string {
  if (score >= 90) return "Peak Vitality";
  if (score >= 75) return "High Euphoric Flow";
  if (score >= 50) return "Active Flow";
  if (score >= 25) return "Grounded";
  return "Depleted";
}

/** Maps energy score to an earthy luxury color from the palette. */
export function energyColor(score: number): string {
  if (score >= 85) return Colors.terracotta;
  if (score >= 70) return Colors.olive;
  if (score >= 50) return Colors.camel;
  return Colors.espressoMuted;
}

/** Clamps a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
