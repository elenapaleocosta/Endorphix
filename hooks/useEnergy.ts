import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import type { EndorphinLog, EnergyWaveDataPoint, ActivityType } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const energyKeys = {
  all: ["energy"] as const,
  logs: (userId: string) => [...energyKeys.all, "logs", userId] as const,
  wave: (userId: string, days: number) =>
    [...energyKeys.all, "wave", userId, days] as const,
};

// ─── Fetch Energy Logs ────────────────────────────────────────────────────────

async function fetchEnergyLogs(userId: string): Promise<EndorphinLog[]> {
  const { data, error } = await supabase
    .from("endorphin_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data as EndorphinLog[];
}

// ─── Fetch Energy Wave (time-series for chart) ────────────────────────────────

async function fetchEnergyWave(
  userId: string,
  days: number
): Promise<EnergyWaveDataPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("endorphin_logs")
    .select("logged_at, energy_score, activity_type")
    .eq("user_id", userId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    date: row.logged_at,
    score: row.energy_score,
    activity_type: row.activity_type,
  }));
}

// ─── Log Energy Mutation ──────────────────────────────────────────────────────

interface LogEnergyInput {
  activity_type: ActivityType;
  energy_score: number;
  duration_minutes?: number;
  facility_id?: string;
  notes?: string;
}

async function logEnergy(
  userId: string,
  input: LogEnergyInput
): Promise<EndorphinLog> {
  const { data, error } = await supabase
    .from("endorphin_logs")
    .insert({
      user_id: userId,
      logged_at: new Date().toISOString(),
      ...input,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EndorphinLog;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useEnergyLogs() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: energyKeys.logs(user?.id ?? ""),
    queryFn: () => fetchEnergyLogs(user!.id),
    enabled: !!user,
  });
}

export function useEnergyWave(days: number = 30) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: energyKeys.wave(user?.id ?? "", days),
    queryFn: () => fetchEnergyWave(user!.id, days),
    enabled: !!user,
  });
}

export function useLogEnergy() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LogEnergyInput) => logEnergy(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: energyKeys.all });
    },
  });
}
