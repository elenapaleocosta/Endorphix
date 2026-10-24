import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Colors } from "@/constants";

interface SportPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accent?: string;
}

export function SportPill({
  label,
  selected,
  onPress,
  accent = Colors.olive,
}: SportPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 12,
        backgroundColor: selected ? accent : Colors.sand,
        borderWidth: 1,
        borderColor: selected ? accent : Colors.sandDark,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          color: selected ? Colors.chalk : Colors.espresso,
          fontSize: 13,
          fontWeight: selected ? "800" : "600",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
