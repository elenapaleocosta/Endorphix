import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useLocationStore } from "@/store/location.store";
import { useSparkFacilities } from "@/hooks/useFacilities";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";
import type { Facility } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");

export default function SparkScreen() {
  const router = useRouter();
  const { heavy, success, tap } = useHaptics();
  const { userLocation } = useLocationStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);

  const {
    data: sparkFacilities,
    isLoading,
    refetch,
    isRefetching,
  } = useSparkFacilities(userLocation);

  const handleRollSpark = async () => {
    heavy();
    await refetch();
    const total = sparkFacilities?.length || 1;
    setCurrentIndex((prev) => (prev + 1) % total);
    setHasRolled(true);
    success();
  };

  const currentVenue: Facility | undefined =
    sparkFacilities && sparkFacilities.length > 0
      ? sparkFacilities[currentIndex % sparkFacilities.length]
      : undefined;

  const handleOpenDirections = (venue: Facility) => {
    tap();
    const { latitude, longitude } = venue.location;
    const label = encodeURIComponent(venue.name);
    const url =
      Platform.OS === "ios"
        ? `maps:?q=${label}&ll=${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${label}`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 110,
          paddingTop: Platform.OS === "ios" ? 56 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450 }}
          style={{ paddingHorizontal: Spacing.xl, marginBottom: 24 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text
              style={{
                color: Colors.terracotta,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2.5,
              }}
            >
              SPONTANEOUS ACTION ENGINE
            </Text>
          </View>
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 34,
              fontWeight: "800",
              letterSpacing: -0.8,
            }}
          >
            The Spark.
          </Text>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 14.5,
              lineHeight: 22,
              marginTop: 6,
            }}
          >
            One tactile tap queries PostGIS for top-rated venues (4.5★+) within 50km. Stop analyzing, start moving.
          </Text>
        </MotiView>

        {/* ─── Hero Tactile Trigger (Terracotta / Clay Rust High Impact) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handleRollSpark}
            activeOpacity={0.88}
            className="cursor-spark"
            style={[
              {
                backgroundColor: Colors.terracotta,
                borderRadius: 18,
                paddingVertical: 20,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
              Platform.OS === "web" && ({
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M13 2L4 14h7l-2 8 11-12h-7l2-8z' fill='%236F2E1B' stroke='%23EDEBE6' stroke-width='1.2' stroke-linejoin='round'/%3E%3C/svg%3E") 4 4, pointer`,
              } as any),
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: Colors.charcoal,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.chalk,
                    fontSize: 16.5,
                    fontWeight: "800",
                    letterSpacing: 0.8,
                  }}
                >
                  SURPRISE ME
                </Text>
                <Text
                  style={{
                    color: Colors.sandLight,
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 2,
                  }}
                >
                  Tap to surface instant verified venue
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.charcoal,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: Colors.chalk,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                {isRefetching ? "ROLLING..." : "ROLL"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Spark Result Venue Card ─── */}
        {currentVenue && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 250 }}
            style={{ paddingHorizontal: Spacing.xl, marginBottom: 24 }}
          >
            <View
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 18,
                padding: 20,
                borderWidth: 1,
                borderColor: Colors.terracotta,
                overflow: "hidden",
              }}
            >
              {/* Badge & Rating Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: Colors.terracotta + "18",
                    paddingHorizontal: 10,
                    paddingVertical: 4.5,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.terracotta + "44",
                    flexShrink: 1,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.terracotta,
                      fontSize: 10.5,
                      fontWeight: "800",
                      letterSpacing: 1.5,
                    }}
                  >
                    ⚡ TOP-RATED SPARK PICK
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: Colors.olive,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ color: Colors.chalk, fontSize: 13, fontWeight: "800" }}>
                    ★ {currentVenue.rating.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Venue Name */}
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 22,
                  fontWeight: "800",
                  letterSpacing: -0.4,
                  lineHeight: 28,
                  marginBottom: 6,
                }}
              >
                {currentVenue.name}
              </Text>

              {/* Description */}
              <Text
                style={{
                  color: Colors.espressoMuted,
                  fontSize: 13.5,
                  lineHeight: 20,
                  marginBottom: 16,
                }}
              >
                {currentVenue.description}
              </Text>

              {/* Realm & Sports Pills */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: Colors.camel + "22",
                    borderWidth: 1,
                    borderColor: Colors.camel + "44",
                  }}
                >
                  <Text style={{ color: Colors.camel, fontSize: 10, fontWeight: "800" }}>
                    REALM: {currentVenue.macro_realm?.toUpperCase() || "LAND"}
                  </Text>
                </View>

                {currentVenue.primary_sports.map((sport) => (
                  <View
                    key={sport}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: Colors.softChalk,
                      borderWidth: 1,
                      borderColor: Colors.sandDark,
                    }}
                  >
                    <Text style={{ color: Colors.espresso, fontSize: 10, fontWeight: "700" }}>
                      {sport.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Distance and Address */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderTopColor: Colors.sandDark,
                  paddingTop: 12,
                  marginBottom: 18,
                }}
              >
                <Text
                  style={{ color: Colors.espressoMuted, fontSize: 12, flex: 1 }}
                  numberOfLines={1}
                >
                  {currentVenue.address}
                </Text>
                {currentVenue.distance_meters !== undefined && (
                  <Text
                    style={{
                      color: Colors.espresso,
                      fontSize: 12,
                      fontWeight: "700",
                      marginLeft: 10,
                    }}
                  >
                    {(currentVenue.distance_meters / 1000).toFixed(1)} km away
                  </Text>
                )}
              </View>

              {/* Expand Activity Feature */}
              {currentVenue.expand_activities && currentVenue.expand_activities.length > 0 && (
                <View
                  style={{
                    backgroundColor: Colors.softChalk,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.olive,
                      fontSize: 10,
                      fontWeight: "800",
                      letterSpacing: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    RECOVERY & ATHLETIC PROTOCOL
                  </Text>
                  <Text
                    style={{ color: Colors.espresso, fontSize: 12.5, fontWeight: "600" }}
                  >
                    {currentVenue.expand_activities[0].title} ({currentVenue.expand_activities[0].durationMinutes}m)
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    tap();
                    router.push(`/facility/${currentVenue.id}`);
                  }}
                  activeOpacity={0.88}
                  style={{
                    backgroundColor: Colors.olive,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.chalk, fontSize: 14, fontWeight: "800" }}>
                    Lock In Slot & Facility Details →
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => handleOpenDirections(currentVenue)}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      backgroundColor: Colors.softChalk,
                      borderWidth: 1,
                      borderColor: Colors.sandDark,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                      Get Directions ↗
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRollSpark}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      backgroundColor: Colors.sand,
                      borderWidth: 1,
                      borderColor: Colors.sandDark,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: Colors.terracotta, fontSize: 13, fontWeight: "700" }}>
                      Roll Next Spark ↺
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
