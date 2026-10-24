import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import type { EndorphinLog, EnergyWaveDataPoint, ActivityType } from "@/types";

// ─── Mock Seed Energy Data for Immediate Tactile Experience ─────────────────

const MOCK_WAVE_DATA: EnergyWaveDataPoint[] = [
  { date: "2026-10-18T08:00:00Z", dayLabel: "Mon", score: 68, activity_type: "run", activity_title: "Sunrise Tempo Run" },
  { date: "2026-10-19T14:30:00Z", dayLabel: "Tue", score: 82, activity_type: "tennis", activity_title: "Clay Court Singles" },
  { date: "2026-10-20T07:15:00Z", dayLabel: "Wed", score: 76, activity_type: "swim", activity_title: "Open Water 2km" },
  { date: "2026-10-21T18:00:00Z", dayLabel: "Thu", score: 91, activity_type: "cycle", activity_title: "Hill Climb Intervals" },
  { date: "2026-10-22T09:00:00Z", dayLabel: "Fri", score: 85, activity_type: "lift", activity_title: "Kinetic Olympic Lifting" },
  { date: "2026-10-23T11:00:00Z", dayLabel: "Sat", score: 94, activity_type: "tennis", activity_title: "Club Tournament Match" },
  { date: "2026-10-24T15:00:00Z", dayLabel: "Sun", score: 89, activity_type: "recovery", activity_title: "Contrast Hydrotherapy" },
];

let localLogsMemory: EndorphinLog[] = [
  {
    id: "log-seed-1",
    user_id: "demo-athlete",
    activity_type: "tennis",
    activity_title: "Club Championship Quarterfinal",
    energy_score: 94,
    duration_minutes: 75,
    facility_name: "The Royal Lawn & Racket Club",
    notes: "Peak neuromuscular flow state. Clean ball striking on clay, deep somatic euphoria.",
    somatic_state: "Peak Vitality",
    logged_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "log-seed-2",
    user_id: "demo-athlete",
    activity_type: "swim",
    activity_title: "Coastal Open Water Swell Swim",
    energy_score: 86,
    duration_minutes: 45,
    facility_name: "Thalassa Coastal Aquatic Pavilion",
    notes: "Cold sea immersion, deep diaphragmatic rhythm.",
    somatic_state: "Active Flow",
    logged_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const energyKeys = {
  all: ["energy"] as const,
  logs: (userId: string) => [...energyKeys.all, "logs", userId] as const,
  wave: (userId: string, days: number) =>
    [...energyKeys.all, "wave", userId, days] as const,
};

// ─── Fetch Energy Logs ────────────────────────────────────────────────────────

async function fetchEnergyLogs(userId: string): Promise<EndorphinLog[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("endorphin_logs")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return (data as any[]).map((row) => ({
          ...row,
          activity_title: row.notes?.split(".")[0] || `${row.activity_type.toUpperCase()} Session`,
        }));
      }
    } catch {
      // Fallback to memory
    }
  }

  return localLogsMemory;
}

// ─── Fetch Energy Wave (time-series for chart) ────────────────────────────────

async function fetchEnergyWave(
  userId: string,
  days: number
): Promise<EnergyWaveDataPoint[]> {
  if (isSupabaseConfigured) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from("endorphin_logs")
        .select("logged_at, energy_score, activity_type, notes")
        .eq("user_id", userId)
        .gte("logged_at", since.toISOString())
        .order("logged_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return (data as any[]).map((row) => {
          const d = new Date(row.logged_at);
          const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
          return {
            date: row.logged_at,
            dayLabel,
            score: row.energy_score,
            activity_type: row.activity_type,
            activity_title: row.notes || "Session",
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  return MOCK_WAVE_DATA;
}

// ─── Log Energy Mutation ──────────────────────────────────────────────────────

export interface LogEnergyInput {
  activity_type: ActivityType;
  activity_title?: string;
  energy_score: number;
  duration_minutes?: number;
  facility_id?: string;
  facility_name?: string;
  notes?: string;
  somatic_state?: string;
}

async function logEnergy(
  userId: string,
  input: LogEnergyInput
): Promise<EndorphinLog> {
  const newLog: EndorphinLog = {
    id: "log-" + Date.now(),
    user_id: userId,
    activity_type: input.activity_type,
    activity_title: input.activity_title || `${input.activity_type.toUpperCase()} Session`,
    energy_score: input.energy_score,
    duration_minutes: input.duration_minutes || 60,
    facility_id: input.facility_id,
    facility_name: input.facility_name,
    notes: input.notes,
    somatic_state: input.somatic_state,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  localLogsMemory = [newLog, ...localLogsMemory];

  if (isSupabaseConfigured) {
    try {
      await supabase.from("endorphin_logs").insert({
        id: newLog.id,
        user_id: userId,
        activity_type: input.activity_type,
        energy_score: input.energy_score,
        duration_minutes: input.duration_minutes || 60,
        facility_id: input.facility_id || null,
        notes: input.notes || null,
        logged_at: newLog.logged_at,
      });
    } catch {
      // Handled via local state
    }
  }

  return newLog;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useEnergyLogs() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: energyKeys.logs(user?.id ?? "demo"),
    queryFn: () => fetchEnergyLogs(user?.id ?? "demo"),
  });
}

export function useEnergyWave(days: number = 30) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: energyKeys.wave(user?.id ?? "demo", days),
    queryFn: () => fetchEnergyWave(user?.id ?? "demo", days),
  });
}

export function useLogEnergy() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LogEnergyInput) => logEnergy(user?.id ?? "demo", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: energyKeys.all });
    },
  });
}
