import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MAX_RADIUS_KM, SPARK_MIN_RATING } from "@/constants";
import { geocodePlace, PlaceNotFoundError, type Place } from "@/lib/geocode";
import {
  getFilteredCuratedFacilities,
  getKnownFacility,
  queryOsmOverpassFacilities,
  queryOsmTripFacilities,
  rememberFacilities,
} from "@/lib/geo-services";
import type { Facility, GeoPoint, MacroRealm, SportCategory } from "@/types";

type FacilityFilter = SportCategory | MacroRealm;

/** ~1 km precision so small GPS drift doesn't refetch the whole list. */
const coarse = (point: GeoPoint) => [Number(point.latitude.toFixed(2)), Number(point.longitude.toFixed(2))] as const;

export const facilityKeys = {
  all: ["facilities"] as const,
  nearby: (location: GeoPoint, filter: FacilityFilter | undefined, radiusKm: number) =>
    [...facilityKeys.all, "nearby", ...coarse(location), filter ?? "all", radiusKm] as const,
  spark: (location: GeoPoint) => [...facilityKeys.all, "spark", ...coarse(location)] as const,
  detail: (id: string) => [...facilityKeys.all, "detail", id] as const,
};

/** Returns RPC rows, or null so the caller can fail over to OpenStreetMap / curated data. */
async function tryRpc(call: () => PromiseLike<{ data: any[] | null; error: unknown }>): Promise<any[] | null> {
  try {
    const { data, error } = await call();
    return !error && data?.length ? data : null;
  } catch {
    return null;
  }
}

function mapRpcRows(rows: any[], origin: GeoPoint): Facility[] {
  return rows.map((row) => ({
    ...row,
    location: { latitude: row.lat ?? origin.latitude, longitude: row.lng ?? origin.longitude },
    images: row.images ?? [],
    timetable: row.timetable ?? {},
    verified_source: "postgis" as const,
  }));
}

async function fetchNearbyFacilities(
  location: GeoPoint,
  filter: FacilityFilter | undefined,
  radiusKm: number,
): Promise<Facility[]> {
  const radiusMeters = Math.min(radiusKm, MAX_RADIUS_KM) * 1000;

  if (isSupabaseConfigured) {
    const isRealm = filter === "water" || filter === "land" || filter === "mountain";
    const rows = await tryRpc(() =>
      supabase.rpc("facilities_within_radius", {
        lat: location.latitude,
        lng: location.longitude,
        radius_meters: radiusMeters,
        sport_filter: isRealm ? null : filter ?? null,
      }),
    );
    if (rows) return rememberFacilities(mapRpcRows(rows, location));
  }

  return queryOsmOverpassFacilities(location, radiusMeters, filter);
}

/** Top-rated venues within range, shuffled once per fetch so each "roll" is a surprise. */
async function fetchSparkFacilities(location: GeoPoint): Promise<Facility[]> {
  if (isSupabaseConfigured) {
    const rows = await tryRpc(() =>
      supabase.rpc("spark_facilities", {
        lat: location.latitude,
        lng: location.longitude,
        radius_meters: MAX_RADIUS_KM * 1000,
        min_rating: SPARK_MIN_RATING,
      }),
    );
    if (rows) return rememberFacilities(mapRpcRows(rows, location));
  }

  const candidates = getFilteredCuratedFacilities(location, MAX_RADIUS_KM * 1000).filter(
    (f) => f.review_count > 0 && f.rating >= SPARK_MIN_RATING,
  );
  return shuffle(candidates);
}

export class FacilityNotFoundError extends Error {
  constructor(id: string) {
    super(`Facility ${id} not found`);
    this.name = "FacilityNotFoundError";
  }
}

async function fetchFacilityDetail(id: string): Promise<Facility> {
  const known = getKnownFacility(id);
  if (known) return known;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("facilities").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        ...data,
        location: { latitude: (data as any).lat, longitude: (data as any).lng },
        images: data.images ?? [],
        timetable: data.timetable ?? {},
      } as unknown as Facility;
    }
  }

  throw new FacilityNotFoundError(id);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useNearbyFacilities(location: GeoPoint | null, filter: FacilityFilter | undefined, radiusKm: number) {
  return useQuery({
    queryKey: location ? facilityKeys.nearby(location, filter, radiusKm) : facilityKeys.all,
    queryFn: () => fetchNearbyFacilities(location!, filter, radiusKm),
    enabled: location !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useSparkFacilities(location: GeoPoint | null) {
  return useQuery({
    queryKey: location ? facilityKeys.spark(location) : facilityKeys.all,
    queryFn: () => fetchSparkFacilities(location!),
    enabled: location !== null,
    staleTime: 2 * 60_000,
    retry: false,
  });
}

export interface TripVenues {
  place: Place;
  /** Venues near the destination, nearest first. */
  venues: Facility[];
  /**
   * True when no real venues answered (OpenStreetMap down, or nothing mapped) and the plan uses the
   * curated sample venues placed around the destination instead. The UI must label these as samples.
   */
  sample: boolean;
}

/**
 * Venues within range of a typed destination, nearest first. Uses the venue database when it's
 * configured, else one combined OpenStreetMap query. If neither finds anything, falls back to the
 * curated sample venues placed around the destination, flagged `sample` so the UI can say so.
 */
async function fetchTripVenues(destination: string): Promise<TripVenues> {
  const real = await fetchRealTripVenues(destination);
  if (real.venues.length) return { ...real, sample: false };
  return {
    place: real.place,
    venues: getFilteredCuratedFacilities(real.place.point, MAX_RADIUS_KM * 1000),
    sample: true,
  };
}

async function fetchRealTripVenues(destination: string): Promise<Omit<TripVenues, "sample">> {
  const place = await geocodePlace(destination);
  const radiusMeters = MAX_RADIUS_KM * 1000;

  if (isSupabaseConfigured) {
    const rows = await tryRpc(() =>
      supabase.rpc("facilities_within_radius", {
        lat: place.point.latitude,
        lng: place.point.longitude,
        radius_meters: radiusMeters,
        sport_filter: null,
      }),
    );
    if (rows) {
      const venues = rememberFacilities(mapRpcRows(rows, place.point)).sort(
        (a, b) => (a.distance_meters ?? 0) - (b.distance_meters ?? 0),
      );
      return { place, venues };
    }
  }

  return { place, venues: await queryOsmTripFacilities(place.point, radiusMeters) };
}

/** Runs only for a submitted destination (never per keystroke), cached for 10 minutes per place. */
export function useTripVenues(destination: string | null) {
  return useQuery({
    queryKey: [...facilityKeys.all, "trip", destination?.trim().toLowerCase() ?? ""],
    queryFn: () => fetchTripVenues(destination!),
    enabled: Boolean(destination?.trim()),
    // A sample plan is stale at once, so the next visit tries the real venues again.
    staleTime: (q) => (q.state.data?.sample ? 0 : 10 * 60_000),
    retry: (count, error) => !(error instanceof PlaceNotFoundError) && count < 1,
  });
}

export function useFacilityDetail(id: string | undefined) {
  return useQuery({
    queryKey: facilityKeys.detail(id ?? ""),
    queryFn: () => fetchFacilityDetail(id!),
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
    retry: (count, error) => !(error instanceof FacilityNotFoundError) && count < 2,
  });
}
