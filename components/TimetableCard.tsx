import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants";
import type { FacilityTimetable } from "@/types";

const DAYS: { key: keyof FacilityTimetable; label: string }[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as keyof FacilityTimetable;

interface TimetableCardProps {
  timetable: FacilityTimetable;
}

export function TimetableCard({ timetable }: TimetableCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
      }}
    >
      {DAYS.map(({ key, label }, index) => {
        const slot = timetable[key];
        const isToday = key === today;

        return (
          <View
            key={key}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: isToday ? Colors.elevated : "transparent",
              borderBottomWidth: index < DAYS.length - 1 ? 1 : 0,
              borderBottomColor: Colors.border,
            }}
          >
            <Text
              style={{
                color: isToday ? Colors.glow : Colors.secondary,
                fontSize: 13,
                fontWeight: isToday ? "700" : "400",
                width: 36,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                color: slot ? Colors.primary : Colors.tertiary,
                fontSize: 13,
                fontWeight: isToday ? "600" : "400",
              }}
            >
              {slot ? `${slot.open} – ${slot.close}` : "Closed"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
