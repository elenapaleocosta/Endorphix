import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useLocationStore } from "@/store/location.store";
import { useSparkFacilities } from "@/hooks/useFacilities";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";
import type { Facility } from "@/types";

const { height: SCREEN_H } = Dimensions.get("window");

export default function SparkScreen() {
  const router = useRouter();
  const { userLocation } = useLocationStore();
  const { heavy, success } = useHaptics();
  const [sparkIndex, setSparkIndex] = useState(0);

  const { data: sparkFacilities, isLoading, refetch } = useSparkFacilities(userLocation);

  const scale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSpark = async () => {
    heavy();
    scale.value = withSequence(
      withSpring(0.94, { damping: 10 }),
      withSpring(1.02, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    await refetch();
    const next =
      sparkFacilities && sparkFacilities.length > 0
        ? (sparkIndex + 1) % sparkFacilities.length
        : 0;
    setSparkIndex(next);
    success();
  };

  const currentFacility: Facility | undefined = sparkFacilities?.[sparkIndex];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.obsidian,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 600 }}
        style={{ paddingTop: 64, marginBottom: 40 }}
      >
        <Text
          style={{
            color: Colors.tertiary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 3,
            marginBottom: 4,
          }}
        >
          THE SPARK
        </Text>
        <Text
          style={{
            color: Colors.primary,
            fontSize: 30,
            fontWeight: "800",
          }}
        >
          Surprise me.
        </Text>
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 14,
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          One tap. Top-rated venue. Zero friction.
        </Text>
      </MotiView>

      {/* Spark Result Card */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        {isLoading ? (
          <ActivityIndicator color={Colors.glow} size="large" />
        ) : currentFacility ? (
          <MotiView
            key={`${currentFacility.id}-${sparkIndex}`}
            from={{ opacity: 0, scale: 0.95, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 18 }}
          >
            <TouchableOpacity
              onPress={() => router.push(`/facility/${currentFacility.id}`)}
              activeOpacity={0.9}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Colors.spark,
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 2,
                      marginBottom: 6,
                    }}
                  >
                    {currentFacility.primary_sports[0]?.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 22,
                      fontWeight: "800",
                      lineHeight: 28,
                    }}
                  >
                    {currentFacility.name}
                  </Text>
                </View>

                {/* Rating Badge */}
                <View
                  style={{
                    backgroundColor: Colors.elevated,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.glow, fontSize: 18, fontWeight: "800" }}>
                    {currentFacility.rating.toFixed(1)}
                  </Text>
                  <Text style={{ color: Colors.tertiary, fontSize: 9, letterSpacing: 1 }}>
                    RATING
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: Colors.secondary,
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {currentFacility.address}
              </Text>

              {currentFacility.distance_meters !== undefined && (
                <Text
                  style={{
                    color: Colors.tertiary,
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  {(currentFacility.distance_meters / 1000).toFixed(1)} km away
                </Text>
              )}
            </TouchableOpacity>
          </MotiView>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: Colors.secondary, fontSize: 15 }}>
              No high-rated facilities nearby.
            </Text>
          </View>
        )}
      </View>

      {/* Spark Button */}
      <View style={{ paddingBottom: 60 }}>
        <Animated.View style={pulseStyle}>
          <TouchableOpacity
            onPress={handleSpark}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.glow,
              borderRadius: 20,
              paddingVertical: 22,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.obsidian,
                fontSize: 16,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            >
              ⚡ SPARK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
