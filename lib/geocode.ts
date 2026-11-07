import { Platform } from "react-native";
import type { GeoPoint } from "@/types";

/**
 * Turns a typed place name ("Mallorca", "St. Moritz") into a point, using OpenStreetMap's
 * Nominatim search. Usage policy: at most one request per second, no search-as-you-type,
 * results cached, and the app identified. So this only runs when the user submits a search.
 * https://operations.osmfoundation.org/policies/nominatim/
 */

export interface Place {
  /** Short label for headings, e.g. "Mallorca, Spain". */
  label: string;
  point: GeoPoint;
}

export class PlaceNotFoundError extends Error {
  constructor(query: string) {
    super(`No place found for "${query}"`);
    this.name = "PlaceNotFoundError";
  }
}

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const TIMEOUT_MS = 8000;
const cache = new Map<string, Place>();

export async function geocodePlace(query: string): Promise<Place> {
  const trimmed = query.trim();
  const key = trimmed.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ q: trimmed, format: "jsonv2", limit: "1", "accept-language": "en" });
  // Browsers send a Referer and forbid setting User-Agent; native apps must identify themselves.
  const headers: Record<string, string> = { Accept: "application/json" };
  if (Platform.OS !== "web") headers["User-Agent"] = "endorphix/1.0 (travel planner)";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${ENDPOINT}?${params}`, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`Place search failed (${response.status})`);
    const results: { lat: string; lon: string; name?: string; display_name: string }[] = await response.json();
    const top = results[0];
    if (!top) throw new PlaceNotFoundError(trimmed);

    const parts = top.display_name.split(",").map((part) => part.trim());
    const name = top.name || parts[0];
    const country = parts[parts.length - 1];
    const place: Place = {
      label: country && country !== name ? `${name}, ${country}` : name,
      point: { latitude: Number(top.lat), longitude: Number(top.lon) },
    };
    cache.set(key, place);
    return place;
  } finally {
    clearTimeout(timer);
  }
}
