import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "./database.types";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://endorphix-preview.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key-preview";

export const isSupabaseConfigured =
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL?.includes("your-project.supabase.co") &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL?.includes("endorphix-preview.supabase.co");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
