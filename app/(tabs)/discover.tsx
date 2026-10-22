import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useLocationStore } from "@/store/location.store";
import { useDiscoverStore } from "@/store/discover.store";
import { useNearbyFacilities, useSparkFacilities } from "@/hooks/useFacilities";
import { useHaptics } from "@/hooks/useHaptics";
import { FacilityCard } from "@/components/FacilityCard";
import { SportPill } from "@/components/SportPill";
import { SearchModeToggle } from "@/components/SearchModeToggle";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { Colors, Spacing } from "@/constants";
import type { Facility, SportCategory } from "@/types";

const SPORTS: { label: string; value: SportCategory }[] = [
  { label: "Run", value: "running" },
  { label: "Cycle", value: "cycling" },
  { label: "Swim", value: "swimming" },
  { label: "Yoga", value: "yoga" },
  { label: "CrossFit", value: "crossfit" },
  { label: "Climb", value: "climbing" },
  { label: "Tennis", value: "tennis" },
  { label: "Football", value: "football" },
  { label: "Basketball", value: "basketball" },
  { label: "Gym", value: "gym" },
  { label: "Hike", value: "hiking" },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { tap, heavy, success } = useHaptics();
  const { userLocation } = useLocationStore();
  const {
    searchMode,
    selectedSport,
    setSelectedSport,
    destination,
    setDestination,
    tourDays,
    setTourDays,
  } = useDiscoverStore();

  const [sparkIndex, setSparkIndex] = useState(0);
  const [sparkActive, setSparkActive] = useState(false);

  const { data: facilities, isLoading, error } = useNearbyFacilities(
    userLocation,
    selectedSport ?? undefined
  );

  const { data: sparkFacilities, isLoading: sparkLoading, refetch: refetchSpark } =
    useSparkFacilities(userLocation);

  const sparkScale = useSharedValue(1);
  const sparkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkScale.value }],
  }));

  const handleSparkTrigger = async () => {
    heavy();
    sparkScale.value = withSequence(
      withSpring(0.92, { damping: 10 }),
      withSpring(1.06, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    await refetchSpark();
    const next =
      sparkFacilities && sparkFacilities.length > 0
        ? (sparkIndex + 1) % sparkFacilities.length
        : 0;
    setSparkIndex(next);
    setSparkActive(true);
    success();
  };

  const sparkVenue: Facility | undefined =
    sparkFacilities && sparkFacilities.length > 0
      ? sparkFacilities[sparkIndex % sparkFacilities.length]
      : undefined;

  const swipePanResponder = useSwipeTabs({
    currentTab: "/(tabs)/discover",
    leftRoute: "/(tabs)/energy", // Slide left -> Energy
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }} {...swipePanResponder.panHandlers}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={{ paddingHorizontal: Spacing.lg, paddingTop: 64, marginBottom: 20 }}
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
            ENDORPHIX ATHLETIC
          </Text>
          <Text
            style={{
              color: Colors.primary,
              fontSize: 32,
              fontWeight: "800",
            }}
          >
            Discover & Spark
          </Text>
        </MotiView>

        {/* ─── MERGED SPARK BUTTON HERO ─── */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: 26 }}>
          <Animated.View style={sparkAnimStyle}>
            <TouchableOpacity
              onPress={handleSparkTrigger}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.glow,
                borderRadius: 18,
                paddingVertical: 18,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: Colors.glow,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 24 }}>⚡</Text>
                <View>
                  <Text
                    style={{
                      color: Colors.obsidian,
                      fontSize: 16,
                      fontWeight: "800",
                      letterSpacing: 1.2,
                    }}
                  >
                    THE SPARK
                  </Text>
                  <Text
                    style={{
                      color: Colors.obsidian + "AA",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Eliminate choice paralysis · Instant top venue
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: Colors.obsidian,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: Colors.glow,
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1,
                  }}
                >
                  ROLL
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Spark Result Card (Appears directly under button when triggered) */}
          {sparkActive && sparkVenue && (
            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 18 }}
              style={{ marginTop: 14 }}
            >
              <TouchableOpacity
                onPress={() => {
                  tap();
                  router.push(`/facility/${sparkVenue.id}`);
                }}
                activeOpacity={0.9}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.glow,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Text
                      style={{
                        color: Colors.spark,
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1.5,
                      }}
                    >
                      ⚡ SPARK PICK
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: Colors.elevated,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 9,
                          fontWeight: "700",
                        }}
                      >
                        {sparkVenue.primary_sports[0]?.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: Colors.elevated,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: Colors.glow, fontSize: 13, fontWeight: "800" }}>
                      ★ {sparkVenue.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: 17,
                    fontWeight: "800",
                    marginBottom: 4,
                  }}
                >
                  {sparkVenue.name}
                </Text>
                <Text style={{ color: Colors.secondary, fontSize: 12, marginBottom: 8 }}>
                  {sparkVenue.address}
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: Colors.glow, fontSize: 12, fontWeight: "600" }}>
                    Tap to view facility details →
                  </Text>
                  {sparkVenue.distance_meters !== undefined && (
                    <Text style={{ color: Colors.tertiary, fontSize: 11 }}>
                      {(sparkVenue.distance_meters / 1000).toFixed(1)} km away
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </MotiView>
          )}
        </View>

        {/* Search Mode Toggle */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: 20 }}>
          <SearchModeToggle />
        </View>

        {searchMode === "sport-first" ? (
          <>
            {/* Sport Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: Spacing.lg,
                gap: 8,
                marginBottom: 24,
              }}
            >
              <SportPill
                label="All"
                selected={selectedSport === null}
                onPress={() => { tap(); setSelectedSport(null); }}
              />
              {SPORTS.map((s) => (
                <SportPill
                  key={s.value}
                  label={s.label}
                  selected={selectedSport === s.value}
                  onPress={() => { tap(); setSelectedSport(s.value); }}
                />
              ))}
            </ScrollView>

            {/* Facilities List Header */}
            <View
              style={{
                paddingHorizontal: Spacing.lg,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: Colors.secondary,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                }}
              >
                NEARBY FACILITIES (50KM)
              </Text>
              <Text style={{ color: Colors.tertiary, fontSize: 12 }}>
                {facilities?.length ?? 0} venues
              </Text>
            </View>

            {/* Facilities List */}
            {isLoading ? (
              <ActivityIndicator
                color={Colors.glow}
                style={{ marginTop: 40 }}
              />
            ) : error ? (
              <ErrorState message="Could not load facilities." />
            ) : (
              <View style={{ paddingHorizontal: Spacing.lg, gap: 14 }}>
                {(facilities ?? []).map((facility, i) => (
                  <MotiView
                    key={facility.id}
                    from={{ opacity: 0, translateY: 16 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 400,
                      delay: i * 60,
                    }}
                  >
                    <FacilityCard
                      facility={facility}
                      onPress={() => {
                        tap();
                        router.push(`/facility/${facility.id}`);
                      }}
                    />
                  </MotiView>
                ))}
                {(facilities ?? []).length === 0 && !isLoading && (
                  <EmptyState sport={selectedSport} />
                )}
              </View>
            )}
          </>
        ) : (
          /* Destination-First */
          <DestinationFirstView
            destination={destination}
            setDestination={setDestination}
            days={tourDays}
            setDays={setTourDays}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Destination-First View ────────────────────────────────────────────────────

function DestinationFirstView({
  destination,
  setDestination,
  days,
  setDays,
}: {
  destination: string;
  setDestination: (v: string) => void;
  days: number;
  setDays: (v: number) => void;
}) {
  const { tap } = useHaptics();

  return (
    <View style={{ paddingHorizontal: Spacing.lg, gap: 20 }}>
      <View>
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          DESTINATION
        </Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="e.g. Athens, Tokyo, NYC…"
          placeholderTextColor={Colors.tertiary}
          style={{
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            color: Colors.primary,
            fontSize: 15,
          }}
        />
      </View>

      <View>
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          DAYS — {days}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1, 2, 3, 5, 7].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => { tap(); setDays(d); }}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: days === d ? Colors.glow : Colors.surface,
                borderWidth: 1,
                borderColor: days === d ? Colors.glow : Colors.border,
              }}
            >
              <Text
                style={{
                  color: days === d ? Colors.obsidian : Colors.secondary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => tap()}
        activeOpacity={0.8}
        style={{
          backgroundColor: Colors.glow,
          borderRadius: 14,
          paddingVertical: 18,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text
          style={{
            color: Colors.obsidian,
            fontSize: 14,
            fontWeight: "700",
            letterSpacing: 1.5,
          }}
        >
          BUILD TOUR PLAN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ sport }: { sport: SportCategory | null }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 40 }}>
      <Text style={{ color: Colors.secondary, fontSize: 15, textAlign: "center" }}>
        No{sport ? ` ${sport}` : ""} facilities found within 50km.
      </Text>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 40 }}>
      <Text style={{ color: Colors.danger, fontSize: 14 }}>{message}</Text>
    </View>
  );
}
