import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Facility, SportCategory, GeoPoint, MacroRealm } from "@/types";
import { MAX_RADIUS_KM, SPARK_MIN_RATING } from "@/constants";
import {
  queryOsmOverpassFacilities,
  getFilteredCuratedFacilities,
  CURATED_HERITAGE_FACILITIES,
  calculateHaversineDistance,
} from "@/lib/geo-services";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const facilityKeys = {
  all: ["facilities"] as const,
  nearby: (location: GeoPoint, filter?: SportCategory | MacroRealm, radiusKm?: number) =>
    [...facilityKeys.all, "nearby", location, filter, radiusKm] as const,
  spark: (location: GeoPoint) =>
    [...facilityKeys.all, "spark", location] as const,
  detail: (id: string) => [...facilityKeys.all, "detail", id] as const,
};

// ─── Fetch Nearby Facilities (Dual-Path & Live Data) ──────────────────────────

async function fetchNearbyFacilities(
  location: GeoPoint,
  filter?: SportCategory | MacroRealm,
  radiusKm: number = MAX_RADIUS_KM
): Promise<Facility[]> {
  const radiusMeters = Math.min(radiusKm, MAX_RADIUS_KM) * 1000;

  if (isSupabaseConfigured) {
    try {
      const isMacro = filter === "water" || filter === "land" || filter === "mountain";
      const { data, error } = await supabase.rpc("facilities_within_radius", {
        lat: location.latitude,
        lng: location.longitude,
        radius_meters: radiusMeters,
        sport_filter: isMacro ? null : (filter as string) ?? null,
      });

      if (!error && data && data.length > 0) {
        return (data as any[]).map((row) => ({
          ...row,
          location: {
            latitude: row.lat ?? location.latitude,
            longitude: row.lng ?? location.longitude,
          },
          images: row.images ?? [],
          timetable: row.timetable ?? {},
          verified_source: "postgis" as const,
        }));
      }
    } catch {
      // Fallback to OSM / Curated
    }
  }

  // Live query via OpenStreetMap Overpass with curated high-end fallback
  return queryOsmOverpassFacilities(location, radiusMeters, filter);
}

// ─── Fetch Spark Facilities (Surprise Me: rating >= 4.5, random order) ────────

async function fetchSparkFacilities(location: GeoPoint): Promise<Facility[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc("spark_facilities", {
        lat: location.latitude,
        lng: location.longitude,
        radius_meters: MAX_RADIUS_KM * 1000,
        min_rating: SPARK_MIN_RATING,
      });

      if (!error && data && data.length > 0) {
        return (data as any[]).map((row) => ({
          ...row,
          location: {
            latitude: row.lat ?? location.latitude,
            longitude: row.lng ?? location.longitude,
          },
          images: row.images ?? [],
          timetable: row.timetable ?? {},
          verified_source: "postgis" as const,
        }));
      }
    } catch {
      // Fall through to curated fallback
    }
  }

  // Top rated facilities shuffled for spontaneous surprise
  const highRated = getFilteredCuratedFacilities(location, MAX_RADIUS_KM * 1000).filter(
    (f) => f.rating >= SPARK_MIN_RATING
  );

  return [...highRated].sort(() => 0.5 - Math.random());
}

// ─── Fetch Facility Detail ─────────────────────────────────────────────────────

async function fetchFacilityDetail(id: string): Promise<Facility> {
  // Check curated heritage list first
  const foundCurated = CURATED_HERITAGE_FACILITIES.find((f) => f.id === id);
  if (foundCurated) return foundCurated;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return {
          ...data,
          location: { latitude: 37.8642, longitude: 23.7538 },
          images: data.images ?? [],
          timetable: data.timetable ?? {},
        } as unknown as Facility;
      }
    } catch {
      // Fall through
    }
  }

  // Fallback to first curated facility if not found
  return CURATED_HERITAGE_FACILITIES[0];
}

// ─── React Query Hooks ─────────────────────────────────────────────────────────

export function useNearbyFacilities(
  location: GeoPoint | null,
  filter?: SportCategory | MacroRealm,
  radiusKm?: number
) {
  const fallbackLocation: GeoPoint = location || { latitude: 37.8642, longitude: 23.7538 };

  return useQuery({
    queryKey: facilityKeys.nearby(fallbackLocation, filter, radiusKm),
    queryFn: () => fetchNearbyFacilities(fallbackLocation, filter, radiusKm),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useSparkFacilities(location: GeoPoint | null) {
  const fallbackLocation: GeoPoint = location || { latitude: 37.8642, longitude: 23.7538 };

  return useQuery({
    queryKey: facilityKeys.spark(fallbackLocation),
    queryFn: () => fetchSparkFacilities(fallbackLocation),
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
}

export function useFacilityDetail(id: string) {
  return useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => fetchFacilityDetail(id),
    staleTime: 1000 * 60 * 10,
  });
}
