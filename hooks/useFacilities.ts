import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Facility, SportCategory, GeoPoint } from "@/types";
import { MAX_RADIUS_KM, SPARK_MIN_RATING } from "@/constants";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const facilityKeys = {
  all: ["facilities"] as const,
  nearby: (location: GeoPoint, sport?: SportCategory) =>
    [...facilityKeys.all, "nearby", location, sport] as const,
  spark: (location: GeoPoint) =>
    [...facilityKeys.all, "spark", location] as const,
  detail: (id: string) => [...facilityKeys.all, "detail", id] as const,
};

// ─── Fetch Nearby Facilities (Sport-First) ────────────────────────────────────

const MOCK_FACILITIES: Facility[] = [
  {
    id: "fac-1",
    name: "Obsidian Athletic Sanctuary",
    description: "Ultra-luxury Olympic training center, cold plunges, sauna, and endurance track.",
    address: "Vouliagmenis Ave 120, Glyfada",
    location: { latitude: 37.864, longitude: 23.753 },
    distance_meters: 1400,
    primary_sports: ["gym", "swimming", "running"],
    secondary_sports: ["crossfit"],
    rating: 4.9,
    review_count: 148,
    timetable: {
      monday: { open: "06:00", close: "23:00" },
      tuesday: { open: "06:00", close: "23:00" },
      wednesday: { open: "06:00", close: "23:00" },
      thursday: { open: "06:00", close: "23:00" },
      friday: { open: "06:00", close: "23:00" },
      saturday: { open: "08:00", close: "21:00" },
      sunday: { open: "08:00", close: "20:00" },
    },
    phone: "+30 210 894 0000",
    images: [],
    is_live: true,
    live_count: 14,
    price_level: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fac-2",
    name: "Apex Kinetic Lab",
    description: "High-altitude simulation chambers and biomechanical movement recovery studio.",
    address: "Kifisias Ave 240, Psychiko",
    location: { latitude: 38.012, longitude: 23.774 },
    distance_meters: 3200,
    primary_sports: ["crossfit", "running", "yoga"],
    secondary_sports: ["pilates"],
    rating: 4.8,
    review_count: 92,
    timetable: {
      monday: { open: "07:00", close: "22:00" },
      tuesday: { open: "07:00", close: "22:00" },
      wednesday: { open: "07:00", close: "22:00" },
      thursday: { open: "07:00", close: "22:00" },
      friday: { open: "07:00", close: "22:00" },
      saturday: { open: "09:00", close: "19:00" },
      sunday: null,
    },
    phone: "+30 210 672 5500",
    images: [],
    is_live: false,
    live_count: 0,
    price_level: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fac-3",
    name: "Aura Recovery & Reformer",
    description: "Matte-aesthetic reformer pilates and breathwork collective.",
    address: "Kolonaki Sq. 14, Athens",
    location: { latitude: 37.978, longitude: 23.742 },
    distance_meters: 850,
    primary_sports: ["yoga", "pilates"],
    secondary_sports: ["gym"],
    rating: 4.95,
    review_count: 215,
    timetable: {
      monday: { open: "06:30", close: "21:30" },
      tuesday: { open: "06:30", close: "21:30" },
      wednesday: { open: "06:30", close: "21:30" },
      thursday: { open: "06:30", close: "21:30" },
      friday: { open: "06:30", close: "21:30" },
      saturday: { open: "08:00", close: "18:00" },
      sunday: { open: "09:00", close: "15:00" },
    },
    phone: "+30 210 729 8810",
    images: [],
    is_live: true,
    live_count: 8,
    price_level: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

async function fetchNearbyFacilities(
  location: GeoPoint,
  sport?: SportCategory,
  radiusKm: number = MAX_RADIUS_KM
): Promise<Facility[]> {
  const isPlaceholderConfig =
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

  if (isPlaceholderConfig) {
    if (!sport) return MOCK_FACILITIES;
    return MOCK_FACILITIES.filter(
      (f) => f.primary_sports.includes(sport) || f.secondary_sports.includes(sport)
    );
  }

  const { data, error } = await supabase.rpc("facilities_within_radius", {
    lat: location.latitude,
    lng: location.longitude,
    radius_meters: radiusKm * 1000,
    sport_filter: sport ?? null,
  });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    location: {
      latitude: row.lat ?? location.latitude,
      longitude: row.lng ?? location.longitude,
    },
    images: row.images ?? [],
    timetable: row.timetable ?? {},
  }));
}

// ─── Fetch Spark Facilities (Surprise Me) ─────────────────────────────────────

async function fetchSparkFacilities(location: GeoPoint): Promise<Facility[]> {
  const isPlaceholderConfig =
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

  if (isPlaceholderConfig) {
    return MOCK_FACILITIES.filter((f) => f.rating >= SPARK_MIN_RATING);
  }

  const { data, error } = await supabase.rpc("spark_facilities", {
    lat: location.latitude,
    lng: location.longitude,
    radius_meters: MAX_RADIUS_KM * 1000,
    min_rating: SPARK_MIN_RATING,
  });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    location: {
      latitude: row.lat ?? location.latitude,
      longitude: row.lng ?? location.longitude,
    },
    images: row.images ?? [],
    timetable: row.timetable ?? {},
  }));
}

// ─── Fetch Facility Detail ─────────────────────────────────────────────────────

async function fetchFacilityDetail(id: string): Promise<Facility> {
  const isPlaceholderConfig =
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

  if (isPlaceholderConfig) {
    const found = MOCK_FACILITIES.find((f) => f.id === id);
    if (found) return found;
  }

  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Facility not found");

  return {
    ...data,
    location: { latitude: 0, longitude: 0 },
    images: data.images ?? [],
    timetable: data.timetable ?? {},
  } as Facility;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useNearbyFacilities(
  location: GeoPoint | null,
  sport?: SportCategory
) {
  return useQuery({
    queryKey: facilityKeys.nearby(location!, sport),
    queryFn: () => fetchNearbyFacilities(location!, sport),
    enabled: !!location,
    staleTime: 1000 * 60 * 3,
  });
}

export function useSparkFacilities(location: GeoPoint | null) {
  return useQuery({
    queryKey: facilityKeys.spark(location!),
    queryFn: () => fetchSparkFacilities(location!),
    enabled: !!location,
    staleTime: 0, // always fresh for Spark
  });
}

export function useFacilityDetail(id: string) {
  return useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => fetchFacilityDetail(id),
    staleTime: 1000 * 60 * 10,
  });
}
