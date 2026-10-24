// ─── Auto-generated Supabase Database Types ───────────────────────────────────

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
          first_name: string | null;
          last_name: string | null;
          nickname: string | null;
          avatar_url: string | null;
          location: unknown | null;
          streak_current: number;
          streak_longest: number;
          lifetime_sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          first_name?: string | null;
          last_name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          location?: unknown | null;
          streak_current?: number;
          streak_longest?: number;
          lifetime_sessions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          first_name?: string | null;
          last_name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          location?: unknown | null;
          streak_current?: number;
          streak_longest?: number;
          lifetime_sessions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          location: unknown;
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
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address: string;
          location: unknown;
          primary_sports?: string[];
          secondary_sports?: string[];
          rating?: number;
          review_count?: number;
          timetable?: Json;
          phone?: string | null;
          website?: string | null;
          images?: string[];
          google_place_id?: string | null;
          osm_id?: string | null;
          is_live?: boolean;
          live_count?: number;
          price_level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["facilities"]["Insert"]>;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          energy_score: number;
          duration_minutes?: number | null;
          facility_id?: string | null;
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["endorphin_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      facilities_within_radius: {
        Args: {
          lat: number;
          lng: number;
          radius_meters: number;
          sport_filter?: string | null;
        };
        Returns: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          lat: number;
          lng: number;
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
          distance_meters: number;
          created_at: string;
          updated_at: string;
        }[];
      };
      spark_facilities: {
        Args: {
          lat: number;
          lng: number;
          radius_meters: number;
          min_rating?: number;
        };
        Returns: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          lat: number;
          lng: number;
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
          distance_meters: number;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      sport_category:
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
      activity_type:
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
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
