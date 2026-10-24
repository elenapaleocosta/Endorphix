import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useDiscoverStore } from "@/store/discover.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors } from "@/constants";
import type { SearchMode } from "@/types";

const MODES: { label: string; value: SearchMode; subtitle: string }[] = [
  { label: "Sport-First", value: "sport-first", subtitle: "50km Realm Radius" },
  { label: "Destination-First", value: "destination-first", subtitle: "Multi-Day Tours" },
];

export function SearchModeToggle() {
  const { searchMode, setSearchMode } = useDiscoverStore();
  const { selection } = useHaptics();
  const [containerWidth, setContainerWidth] = useState(0);

  const translateX = useSharedValue(searchMode === "sport-first" ? 0 : 1);

  const pillStyle = useAnimatedStyle(() => {
    const half = (containerWidth - 6) / 2;
    return {
      transform: [
        {
          translateX: withSpring(translateX.value * half, {
            damping: 20,
            stiffness: 180,
          }),
        },
      ],
      width: half > 0 ? half : "50%",
    };
  });

  const handlePress = (mode: SearchMode) => {
    selection();
    setSearchMode(mode);
    translateX.value = mode === "sport-first" ? 0 : 1;
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
  };

  return (
    <View
      onLayout={handleLayout}
      style={{
        flexDirection: "row",
        backgroundColor: Colors.sand,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        padding: 3,
        position: "relative",
      }}
    >
      {/* Sliding Pill Background */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 3,
              bottom: 3,
              left: 3,
              backgroundColor: Colors.olive,
              borderRadius: 11,
            },
            pillStyle,
          ]}
        />
      )}

      {MODES.map((mode) => {
        const isSelected = searchMode === mode.value;
        return (
          <TouchableOpacity
            key={mode.value}
            onPress={() => handlePress(mode.value)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <Text
              style={{
                color: isSelected ? Colors.chalk : Colors.espresso,
                fontSize: 13,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {mode.label}
            </Text>
            <Text
              style={{
                color: isSelected ? Colors.sandLight : Colors.espressoMuted,
                fontSize: 10,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {mode.subtitle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
