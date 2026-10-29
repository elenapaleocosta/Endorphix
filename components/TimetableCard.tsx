import { Text, View } from "react-native";
import { todayKey } from "@/utils";
import { Card } from "@/components/ui";
import type { FacilityTimetable } from "@/types";

const DAYS: { key: keyof FacilityTimetable; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function TimetableCard({ timetable }: { timetable: FacilityTimetable }) {
  const hasHours = DAYS.some(({ key }) => timetable[key] !== undefined);
  const today = todayKey();

  if (!hasHours) {
    return (
      <View className="rounded-2xl border border-dashed border-line px-4 py-6">
        <Text className="text-center text-sm text-ink-muted">Opening hours aren't listed for this venue.</Text>
      </View>
    );
  }

  return (
    <Card flush>
      {DAYS.map(({ key, label }, index) => {
        const slot = timetable[key];
        const isToday = key === today;
        const hours = slot ? `${slot.open} – ${slot.close}` : "Closed";
        return (
          <View
            key={key}
            accessible
            accessibilityLabel={`${label}${isToday ? ", today" : ""}: ${hours}`}
            className={`flex-row items-center justify-between px-4 py-3 ${isToday ? "bg-paper" : ""} ${
              index < DAYS.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <Text className={`text-sm ${isToday ? "font-bold text-olive" : "text-ink-muted"}`}>
              {label}
              {isToday ? " · Today" : ""}
            </Text>
            <Text className={`text-sm ${isToday ? "font-bold text-ink" : slot ? "text-ink" : "text-ink-muted"}`}>
              {hours}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
