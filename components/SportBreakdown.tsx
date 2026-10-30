import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SPORT_BY_ID } from "@/constants";
import { sportLabel } from "@/utils";
import { Card, Chip, Eyebrow } from "@/components/ui";
import type { Booking, SportCategory } from "@/types";

const DAY_MS = 86_400_000;

const TIMEFRAMES = [
  { id: "today", label: "Today", days: 1 },
  { id: "week", label: "Week", days: 7 },
  { id: "month", label: "Month", days: 30 },
  { id: "half", label: "6 months", days: 182 },
  { id: "all", label: "All time", days: Infinity },
] as const;

type TimeframeId = (typeof TIMEFRAMES)[number]["id"];

interface SportCount {
  sport: SportCategory;
  count: number;
  conditioning?: number;
}

function countBySport(bookings: Booking[], days: number): SportCount[] {
  const since = Date.now() - days * DAY_MS;
  const counts = new Map<SportCategory, number>();
  for (const b of bookings) {
    if (!b.sport_category || new Date(b.created_at).getTime() < since) continue;
    counts.set(b.sport_category, (counts.get(b.sport_category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([sport, count]) => ({
      sport,
      count,
      conditioning: sport === "other" ? undefined : SPORT_BY_ID[sport]?.conditioning,
    }))
    .sort((a, b) => b.count - a.count || (b.conditioning ?? 0) - (a.conditioning ?? 0));
}

/** Sessions per sport for a timeframe, headed by the most-trained sport and its conditioning index. */
export function SportBreakdown({ bookings }: { bookings: Booking[] }) {
  const [timeframe, setTimeframe] = useState<TimeframeId>("all");
  const days = TIMEFRAMES.find((t) => t.id === timeframe)!.days;
  const rows = useMemo(() => countBySport(bookings, days), [bookings, days]);
  const top = rows[0];
  const max = top?.count ?? 1;

  return (
    <Card>
      <View className="flex-row flex-wrap gap-2">
        {TIMEFRAMES.map((t) => (
          <Chip key={t.id} label={t.label} selected={t.id === timeframe} onPress={() => setTimeframe(t.id)} />
        ))}
      </View>

      {top ? (
        <>
          <View className="mt-4 rounded-xl border border-line bg-raised p-4">
            <Eyebrow tone="accent">Most trained</Eyebrow>
            <Text className="mt-1 text-xl font-bold text-fg">{sportLabel(top.sport)}</Text>
            <Text className="mt-0.5 text-sm text-fg-muted">
              {top.count} {top.count === 1 ? "session" : "sessions"}
              {top.conditioning ? ` · conditioning index ${top.conditioning}/100` : ""}
            </Text>
          </View>

          <View className="mt-4 gap-3">
            {rows.map((row) => (
              <View
                key={row.sport}
                accessible
                accessibilityLabel={`${sportLabel(row.sport)}: ${row.count} ${row.count === 1 ? "session" : "sessions"}`}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-semibold text-fg">
                    {sportLabel(row.sport)}
                  </Text>
                  <Text className="text-sm text-fg-muted">{row.count}</Text>
                </View>
                <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <View className="h-full rounded-full bg-accent" style={{ width: `${(row.count / max) * 100}%` }} />
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text className="mt-4 text-sm text-fg-muted">No sessions booked in this period.</Text>
      )}
    </Card>
  );
}
