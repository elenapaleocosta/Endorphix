import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MAX_RADIUS_KM, SPARK_MIN_RATING } from "@/constants";
import {
  getFilteredCuratedFacilities,
  getKnownFacility,
  queryOsmOverpassFacilities,
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

export function useFacilityDetail(id: string | undefined) {
  return useQuery({
    queryKey: facilityKeys.detail(id ?? ""),
    queryFn: () => fetchFacilityDetail(id!),
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
    retry: (count, error) => !(error instanceof FacilityNotFoundError) && count < 2,
  });
}
