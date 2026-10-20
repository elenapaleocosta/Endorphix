import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Colors } from "@/constants";

interface LiveBadgeProps {
  count?: number;
}

export function LiveBadge({ count }: LiveBadgeProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      false
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: Colors.live + "22",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.live + "55",
      }}
    >
      <Animated.View
        style={[
          {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: Colors.live,
          },
          dotStyle,
        ]}
      />
      <Text
        style={{
          color: Colors.live,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.5,
        }}
      >
        LIVE NOW{count !== undefined ? ` · ${count}` : ""}
      </Text>
    </View>
  );
}
