import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { energyBand } from "@/utils";
import type { ActivityType, EndorphinLog, EnergyWaveDataPoint } from "@/types";

const DAY_MS = 86_400_000;

function seedLog(daysAgo: number, activity_type: ActivityType, activity_title: string, energy_score: number): EndorphinLog {
  const at = new Date(Date.now() - daysAgo * DAY_MS).toISOString();
  return {
    id: `log-seed-${daysAgo}`,
    user_id: "local",
    activity_type,
    activity_title,
    energy_score,
    duration_minutes: 60,
    somatic_state: energyBand(energy_score).label,
    logged_at: at,
    created_at: at,
  };
}

/** Local log book used when Supabase isn't configured. Newest first. */
let localLogs: EndorphinLog[] = [
  seedLog(1, "tennis", "Club tournament match", 94),
  seedLog(2, "recovery", "Contrast hydrotherapy", 89),
  seedLog(3, "lift", "Olympic lifting", 85),
  seedLog(4, "cycle", "Hill climb intervals", 91),
  seedLog(5, "swim", "Open water 2 km", 76),
  seedLog(6, "tennis", "Clay court singles", 82),
  seedLog(7, "run", "Sunrise tempo run", 68),
];

export function clearLocalEnergyLogs() {
  localLogs = [];
}

export const energyKeys = {
  all: ["energy"] as const,
  logs: (userId: string) => [...energyKeys.all, "logs", userId] as const,
  wave: (userId: string, days: number) => [...energyKeys.all, "wave", userId, days] as const,
};

async function fetchEnergyLogs(userId: string): Promise<EndorphinLog[]> {
  if (!isSupabaseConfigured) return localLogs;

  const { data, error } = await supabase
    .from("endorphin_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data as any[]).map((row) => ({
    ...row,
    activity_title: row.notes?.split(".")[0] || `${row.activity_type} session`,
  }));
}

function toWavePoint(log: Pick<EndorphinLog, "logged_at" | "energy_score" | "activity_type" | "activity_title">): EnergyWaveDataPoint {
  return {
    date: log.logged_at,
    dayLabel: new Date(log.logged_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    score: log.energy_score,
    activity_type: log.activity_type,
    activity_title: log.activity_title,
  };
}

async function fetchEnergyWave(userId: string, days: number): Promise<EnergyWaveDataPoint[]> {
  const since = Date.now() - days * DAY_MS;

  if (!isSupabaseConfigured) {
    return localLogs
      .filter((log) => new Date(log.logged_at).getTime() >= since)
      .map(toWavePoint)
      .reverse();
  }

  const { data, error } = await supabase
    .from("endorphin_logs")
    .select("logged_at, energy_score, activity_type, notes")
    .eq("user_id", userId)
    .gte("logged_at", new Date(since).toISOString())
    .order("logged_at", { ascending: true });
  if (error) throw error;

  return (data as any[]).map((row) => toWavePoint({ ...row, activity_title: row.notes || "Session" }));
}

export interface LogEnergyInput {
  activity_type: ActivityType;
  activity_title: string;
  energy_score: number;
  facility_id?: string;
  facility_name?: string;
  notes?: string;
}

async function logEnergy(userId: string, input: LogEnergyInput): Promise<EndorphinLog> {
  const now = new Date().toISOString();
  const log: EndorphinLog = {
    id: `log-${Date.now()}`,
    user_id: userId,
    ...input,
    duration_minutes: 60,
    somatic_state: energyBand(input.energy_score).label,
    logged_at: now,
    created_at: now,
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from("endorphin_logs").insert({
      user_id: userId,
      activity_type: input.activity_type,
      energy_score: input.energy_score,
      duration_minutes: log.duration_minutes,
      facility_id: input.facility_id ?? null,
      notes: input.notes ?? null,
      logged_at: now,
    });
    if (error) throw error;
  } else {
    localLogs = [log, ...localLogs];
  }

  return log;
}

function useUserId() {
  return useAuthStore((s) => s.user?.id ?? "local");
}

export function useEnergyLogs() {
  const userId = useUserId();
  return useQuery({ queryKey: energyKeys.logs(userId), queryFn: () => fetchEnergyLogs(userId) });
}

export function useEnergyWave(days = 30) {
  const userId = useUserId();
  return useQuery({ queryKey: energyKeys.wave(userId, days), queryFn: () => fetchEnergyWave(userId, days) });
}

export function useLogEnergy() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LogEnergyInput) => logEnergy(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: energyKeys.all }),
  });
}
