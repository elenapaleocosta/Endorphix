import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { REALM_BY_ID, SPORT_BY_ID } from "@/constants";
import { sportLabel } from "@/utils";
import { Card, Eyebrow, SegmentedControl } from "@/components/ui";
import type { Booking, SportCategory } from "@/types";

/**
 * A small dot in the sport's realm colour (the same three as the Realm mix bar) is the only colour here;
 * bars stay steel so the card reads calm. "Other" has no realm, so no dot.
 */
function realmOf(sport: SportCategory) {
  return sport === "other" ? undefined : REALM_BY_ID[SPORT_BY_ID[sport].realm];
}

const DAY_MS = 86_400_000;

// Short labels, as fitness apps write them, so all five fit one quiet segmented track on a phone.
// Screen readers get the full name.
const TIMEFRAMES = [
  { value: "today", label: "1D", spoken: "Today", days: 1, empty: "today" },
  { value: "week", label: "1W", spoken: "Last 7 days", days: 7, empty: "in the last 7 days" },
  { value: "month", label: "1M", spoken: "Last 30 days", days: 30, empty: "in the last 30 days" },
  { value: "half", label: "6M", spoken: "Last 6 months", days: 182, empty: "in the last 6 months" },
  { value: "all", label: "All", spoken: "All time", days: Infinity, empty: "yet" },
] as const;

type TimeframeId = (typeof TIMEFRAMES)[number]["value"];

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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Sessions per sport for a timeframe: a total, the leading sport when there is one, then each sport's share. */
export function SportBreakdown({ bookings }: { bookings: Booking[] }) {
  const [timeframe, setTimeframe] = useState<TimeframeId>("all");
  const frame = TIMEFRAMES.find((t) => t.value === timeframe)!;
  const rows = useMemo(() => countBySport(bookings, frame.days), [bookings, frame.days]);
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  // Only call a sport "most trained" when it actually leads; a tie has no winner worth highlighting.
  const leader = rows.length > 1 && rows[0].count > rows[1].count ? rows[0] : undefined;

  return (
    <Card>
      <SegmentedControl
        accessibilityLabel="Timeframe"
        options={TIMEFRAMES.map(({ value, label, spoken }) => ({ value, label, accessibilityLabel: spoken }))}
        value={timeframe}
        onChange={setTimeframe}
      />

      {rows.length ? (
        <>
          <Text className="mt-4 text-sm text-fg-muted">
            <Text className="font-bold text-fg">{plural(total, "session", "sessions")}</Text>
            {` across ${plural(rows.length, "sport", "sports")}`}
          </Text>

          {leader ? (
            <View className="mt-3 rounded-xl border border-line bg-raised px-4 py-3">
              <Eyebrow tone="accent">Most trained</Eyebrow>
              <Text className="mt-1 text-lg font-bold text-fg">{sportLabel(leader.sport)}</Text>
              {leader.conditioning ? (
                <Text className="text-sm text-fg-muted">Conditioning index {leader.conditioning}/100</Text>
              ) : null}
            </View>
          ) : null}

          <View className="mt-4 gap-3.5">
            {rows.map((row) => {
              const share = row.count / total;
              return (
                <View
                  key={row.sport}
                  accessible
                  accessibilityLabel={`${sportLabel(row.sport)}: ${plural(row.count, "session", "sessions")}, ${Math.round(share * 100)}%`}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      {realmOf(row.sport) ? (
                        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: realmOf(row.sport)!.accent }} />
                      ) : null}
                      <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-semibold text-fg">
                        {sportLabel(row.sport)}
                      </Text>
                    </View>
                    <Text className="text-sm text-fg-muted">{plural(row.count, "session", "sessions")}</Text>
                  </View>
                  {/* Bars show each sport's share of all sessions, so an even mix looks even, not all full. */}
                  <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                    <View className="h-full rounded-full bg-accent" style={{ width: `${share * 100}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <Text className="mt-4 text-sm text-fg-muted">No sessions {frame.empty}.</Text>
      )}
    </Card>
  );
}
