// ─── endorphix Domain Types ───────────────────────────────────────────────────

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ─── User & Vitality Passport ──────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: GeoPoint;
  streak_current: number;
  streak_longest: number;
  lifetime_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  total_energy_logs: number;
  average_energy_score: number;
  highest_energy_score?: number;
  macro_realm_distribution?: {
    water: number;
    land: number;
    mountain: number;
  };
}

// ─── Macro Sport Realms (Water, Land, Mountain) ───────────────────────────────

export type MacroRealm = "water" | "land" | "mountain";

export type SportCategory =
  | "running"
  | "cycling"
  | "swimming"
  | "yoga"
  | "crossfit"
  | "tennis"
  | "climbing"
  | "martial_arts"
  | "football"
  | "basketball"
  | "gym"
  | "hiking"
  | "pilates"
  | "rowing"
  | "surfing"
  | "padel"
  | "trail_running"
  | "other";

export interface MacroRealmDefinition {
  id: MacroRealm;
  label: "Water" | "Land" | "Mountain";
  tagline: string;
  accent: string;
  sports: SportCategory[];
}

export const MACRO_REALMS: MacroRealmDefinition[] = [
  {
    id: "water",
    label: "Water",
    tagline: "Hydrodynamic conditioning & open-water vitality",
    accent: "#A7744B",
    sports: ["swimming", "rowing", "surfing"],
  },
  {
    id: "land",
    label: "Land",
    tagline: "High-cadence running, tennis clubs & kinetic mastery",
    accent: "#5A6738",
    sports: ["tennis", "running", "cycling", "gym", "crossfit", "padel", "yoga"],
  },
  {
    id: "mountain",
    label: "Mountain",
    tagline: "Vertical ascent, alpine endurance & trail velocity",
    accent: "#6F2E1B",
    sports: ["trail_running", "climbing", "hiking"],
  },
];

export interface FacilityTimetable {
  monday?: { open: string; close: string } | null;
  tuesday?: { open: string; close: string } | null;
  wednesday?: { open: string; close: string } | null;
  thursday?: { open: string; close: string } | null;
  friday?: { open: string; close: string } | null;
  saturday?: { open: string; close: string } | null;
  sunday?: { open: string; close: string } | null;
}

export interface FacilityOnsiteActivity {
  id: string;
  title: string;
  category: "recovery" | "endurance" | "tactile" | "coaching";
  durationMinutes: number;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  address: string;
  location: GeoPoint;
  distance_meters?: number;
  macro_realm?: MacroRealm;
  primary_sports: SportCategory[];
  secondary_sports: SportCategory[];
  rating: number;
  review_count: number;
  timetable: FacilityTimetable;
  phone?: string;
  website?: string;
  images: string[];
  google_place_id?: string;
  osm_id?: string;
  is_live?: boolean;
  live_count?: number;
  price_level?: 0 | 1 | 2 | 3 | 4;
  expand_activities?: FacilityOnsiteActivity[];
  verified_source?: "osm_overpass" | "google_places" | "postgis" | "curated_patron";
  created_at: string;
  updated_at: string;
}

// ─── Endorphin Logs & Energy Meter ───────────────────────────────────────────

export type ActivityType =
  | "soccer"
  | "basketball"
  | "tennis"
  | "run"
  | "cycle"
  | "swim"
  | "lift"
  | "yoga"
  | "hike"
  | "climb"
  | "court"
  | "recovery"
  | "other";

export type BookingStatus = "confirmed" | "completed" | "energy_logged";

export interface Booking {
  id: string;
  facility_id: string;
  facility_name: string;
  activity_name: string;
  activity_type: ActivityType;
  court_or_slot: string;
  date: string;
  start_time: string;
  end_time: string;
  notification_scheduled_time: string;
  status: BookingStatus;
  logged_energy_score?: number;
  created_at: string;
}

export interface EndorphinLog {
  id: string;
  user_id: string;
  booking_id?: string;
  facility_id?: string;
  facility_name?: string;
  activity_type: ActivityType;
  activity_title: string;
  energy_score: number; // 1–100
  duration_minutes?: number;
  slot_time?: string;
  notes?: string;
  somatic_state?: string;
  logged_at: string;
  created_at: string;
}

export interface EnergyWaveDataPoint {
  date: string;
  dayLabel: string;
  score: number;
  activity_type: ActivityType;
  activity_title?: string;
}

// ─── Destination Tour Action Packages ────────────────────────────────────────

export interface TourPackageActivity {
  timeOfDay: "Morning" | "Afternoon" | "Sunset / Evening";
  title: string;
  sport: SportCategory;
  facility: Facility;
  intensity: "High" | "Extreme" | "Recovery";
  description: string;
}

export interface TourDay {
  day: number;
  date: string;
  theme: string;
  activities: TourPackageActivity[];
}

export interface TourPlan {
  id: string;
  destination: string;
  days: number;
  radiusKm: number;
  realms: MacroRealm[];
  tour_days: TourDay[];
  created_at: string;
}

// ─── Discover Search Params ───────────────────────────────────────────────────

export type SearchMode = "sport-first" | "destination-first";

export interface SportFirstParams {
  realm?: MacroRealm;
  sport?: SportCategory;
  radius_km: number;
  user_location: GeoPoint;
}

export interface DestinationFirstParams {
  destination: string;
  days: number;
  radius_km: number;
  preferredRealms: MacroRealm[];
}
