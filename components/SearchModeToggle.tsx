import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useDiscoverStore } from "@/store/discover.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors } from "@/constants";
import type { SearchMode } from "@/types";

const MODES: { label: string; value: SearchMode }[] = [
  { label: "Sport", value: "sport-first" },
  { label: "Destination", value: "destination-first" },
];

export function SearchModeToggle() {
  const { searchMode, setSearchMode } = useDiscoverStore();
  const { selection } = useHaptics();
  const offset = useSharedValue(searchMode === "sport-first" ? 0 : 1);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(offset.value * 50 + "%", {
          damping: 18,
          stiffness: 200,
        }),
      },
    ],
  }));

  const handlePress = (mode: SearchMode) => {
    selection();
    setSearchMode(mode);
    offset.value = mode === "sport-first" ? 0 : 1;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 3,
        position: "relative",
      }}
    >
      {MODES.map((mode) => (
        <TouchableOpacity
          key={mode.value}
          onPress={() => handlePress(mode.value)}
          style={{ flex: 1, paddingVertical: 10, alignItems: "center", zIndex: 1 }}
        >
          <Text
            style={{
              color:
                searchMode === mode.value ? Colors.obsidian : Colors.secondary,
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Sliding Pill Background */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 3,
            bottom: 3,
            left: 3,
            width: "50%",
            backgroundColor: Colors.glow,
            borderRadius: 9,
          },
          pillStyle,
        ]}
      />
    </View>
  );
}
