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
        backgroundColor: Colors.sand,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.sandDark,
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
              backgroundColor: isToday ? Colors.softChalk : "transparent",
              borderBottomWidth: index < DAYS.length - 1 ? 1 : 0,
              borderBottomColor: Colors.sandDark,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {isToday && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.olive,
                  }}
                />
              )}
              <Text
                style={{
                  color: isToday ? Colors.olive : Colors.espressoMuted,
                  fontSize: 13,
                  fontWeight: isToday ? "800" : "500",
                  width: 38,
                }}
              >
                {label}
              </Text>
            </View>

            {slot ? (
              <Text
                style={{
                  color: isToday ? Colors.espresso : Colors.espressoMuted,
                  fontSize: 13,
                  fontWeight: isToday ? "700" : "400",
                }}
              >
                {slot.open} – {slot.close}
              </Text>
            ) : (
              <Text
                style={{
                  color: Colors.espressoFaint,
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                Rest / Closed
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
