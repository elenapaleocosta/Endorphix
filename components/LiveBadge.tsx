import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants";

interface LiveBadgeProps {
  count?: number;
}

export function LiveBadge({ count }: LiveBadgeProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: Colors.terracotta + "18",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.terracotta + "44",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: Colors.terracotta,
        }}
      />
      <Text
        style={{
          color: Colors.terracotta,
          fontSize: 10.5,
          fontWeight: "800",
          letterSpacing: 1.2,
        }}
      >
        LIVE NOW{count !== undefined ? ` · ${count}` : ""}
      </Text>
    </View>
  );
}
