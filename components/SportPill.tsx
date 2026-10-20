import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Colors } from "@/constants";

interface SportPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SportPill({ label, selected, onPress }: SportPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: selected ? Colors.glow : Colors.surface,
        borderWidth: 1,
        borderColor: selected ? Colors.glow : Colors.border,
      }}
    >
      <Text
        style={{
          color: selected ? Colors.obsidian : Colors.secondary,
          fontSize: 13,
          fontWeight: selected ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
