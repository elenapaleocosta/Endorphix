// ─── Auto-generated Supabase Database Types ───────────────────────────────────
// Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_url: string | null;
          location: unknown | null; // PostGIS geometry
          streak_current: number;
          streak_longest: number;
          lifetime_sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "created_at" | "updated_at" | "streak_current" | "streak_longest" | "lifetime_sessions"
        > & {
          streak_current?: number;
          streak_longest?: number;
          lifetime_sessions?: number;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          location: unknown; // PostGIS geometry
          primary_sports: string[];
          secondary_sports: string[];
          rating: number;
          review_count: number;
          timetable: Json;
          phone: string | null;
          website: string | null;
          images: string[];
          google_place_id: string | null;
          osm_id: string | null;
          is_live: boolean;
          live_count: number;
          price_level: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["facilities"]["Row"],
          "created_at" | "updated_at" | "is_live" | "live_count"
        > & {
          is_live?: boolean;
          live_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["facilities"]["Insert"]>;
      };
      endorphin_logs: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          energy_score: number;
          duration_minutes: number | null;
          facility_id: string | null;
          notes: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["endorphin_logs"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["endorphin_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      facilities_within_radius: {
        Args: {
          lat: number;
          lng: number;
          radius_meters: number;
          sport_filter?: string | null;
        };
        Returns: Array<
          Database["public"]["Tables"]["facilities"]["Row"] & {
            distance_meters: number;
          }
        >;
      };
      spark_facilities: {
        Args: {
          lat: number;
          lng: number;
          radius_meters: number;
          min_rating?: number;
        };
        Returns: Array<
          Database["public"]["Tables"]["facilities"]["Row"] & {
            distance_meters: number;
          }
        >;
      };
    };
    Enums: Record<string, never>;
  };
}
