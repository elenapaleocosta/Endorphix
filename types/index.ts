// ─── Shared Domain Types ─────────────────────────────────────────────────────

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
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
}

// ─── Facilities ───────────────────────────────────────────────────────────────

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
  | "other";

export interface FacilityTimetable {
  monday?: { open: string; close: string } | null;
  tuesday?: { open: string; close: string } | null;
  wednesday?: { open: string; close: string } | null;
  thursday?: { open: string; close: string } | null;
  friday?: { open: string; close: string } | null;
  saturday?: { open: string; close: string } | null;
  sunday?: { open: string; close: string } | null;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  address: string;
  location: GeoPoint;
  distance_meters?: number;
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
  created_at: string;
  updated_at: string;
}

// ─── Endorphin Logs ───────────────────────────────────────────────────────────

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
  activity_name: string; // e.g. "Tennis", "Basketball", "Soccer"
  activity_type: ActivityType;
  court_or_slot: string; // e.g. "Court 1", "Indoor Court B"
  date: string; // "Today", "2026-10-20"
  start_time: string; // "14:00"
  end_time: string; // "15:00"
  notification_scheduled_time: string; // "15:30" (half an hour after finish)
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
  logged_at: string;
  created_at: string;
}

export interface EnergyWaveDataPoint {
  date: string;
  score: number;
  activity_type: ActivityType;
}

// ─── Tour Plan ────────────────────────────────────────────────────────────────

export interface TourDay {
  day: number;
  date: string;
  facilities: Facility[];
  suggested_activities: ActivityType[];
}

export interface TourPlan {
  id: string;
  destination: string;
  days: number;
  preferences: SportCategory[];
  tour_days: TourDay[];
  created_at: string;
}

// ─── Discover Search ──────────────────────────────────────────────────────────

export type SearchMode = "sport-first" | "destination-first";

export interface SportFirstParams {
  sport: SportCategory;
  radius_km: number;
  user_location: GeoPoint;
}

export interface DestinationFirstParams {
  destination: string;
  days: number;
  preferences: SportCategory[];
}
