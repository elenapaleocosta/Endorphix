import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useLocationStore } from "@/store/location.store";
import { useDiscoverStore } from "@/store/discover.store";
import { useBookingStore } from "@/store/booking.store";
import { useNearbyFacilities } from "@/hooks/useFacilities";
import { useHaptics } from "@/hooks/useHaptics";
import { FacilityCard } from "@/components/FacilityCard";
import { SearchModeToggle } from "@/components/SearchModeToggle";
import { SportAthleticStats } from "@/components/SportAthleticStats";
import { Colors, Spacing, MAX_RADIUS_KM } from "@/constants";
import { MACRO_REALMS, type SportCategory, type MacroRealm, type TourPlan } from "@/types";
import { generateDestinationActionPackages } from "@/lib/geo-services";

const ALL_SPORTS: { label: string; value: SportCategory; icon: string; realm: MacroRealm }[] = [
  { label: "Soccer / Football", value: "football", icon: "⚽", realm: "land" },
  { label: "Basketball", value: "basketball", icon: "🏀", realm: "land" },
  { label: "Volleyball", value: "volleyball", icon: "🏐", realm: "land" },
  { label: "Tennis", value: "tennis", icon: "🎾", realm: "land" },
  { label: "Swimming", value: "swimming", icon: "🏊", realm: "water" },
  { label: "Hiking", value: "hiking", icon: "🥾", realm: "mountain" },
  { label: "Running", value: "running", icon: "🏃", realm: "land" },
  { label: "Cycling", value: "cycling", icon: "🚴", realm: "land" },
  { label: "Climbing", value: "climbing", icon: "🧗", realm: "mountain" },
  { label: "Padel", value: "padel", icon: "🏓", realm: "land" },
  { label: "Athletic Gym", value: "gym", icon: "🏋️", realm: "land" },
  { label: "Boxing & Combat", value: "boxing", icon: "🥊", realm: "land" },
  { label: "Surfing", value: "surfing", icon: "🏄", realm: "water" },
  { label: "Rowing", value: "rowing", icon: "🚣", realm: "water" },
  { label: "Sailing", value: "sailing", icon: "⛵", realm: "water" },
  { label: "Trail Running", value: "trail_running", icon: "🌲", realm: "mountain" },
  { label: "Pilates", value: "pilates", icon: "🤸", realm: "land" },
  { label: "Yoga", value: "yoga", icon: "🧘", realm: "land" },
  { label: "CrossFit", value: "crossfit", icon: "⚡", realm: "land" },
  { label: "Martial Arts", value: "martial_arts", icon: "🥋", realm: "land" },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { tap, selection, success } = useHaptics();
  const { userLocation } = useLocationStore();
  const { bookings, openEnergyLoggingForBooking } = useBookingStore();
  const pendingBooking = bookings.find((b) => b.status === "completed");
  const {
    searchMode,
    selectedRealm,
    setSelectedRealm,
    selectedSport,
    setSelectedSport,
    radiusKm,
    setRadiusKm,
    destination,
    setDestination,
    tourDays,
    setTourDays,
    tourRealms,
    setTourRealms,
  } = useDiscoverStore();

  const [generatedPlan, setGeneratedPlan] = useState<TourPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Active filter for sport-first
  const activeFilter = selectedSport || selectedRealm || undefined;

  const {
    data: facilities,
    isLoading,
    error,
    refetch,
  } = useNearbyFacilities(userLocation, activeFilter, radiusKm);

  const handleSelectRealm = (realm: MacroRealm) => {
    selection();
    if (selectedRealm === realm) {
      setSelectedRealm(null);
      setSelectedSport(null);
    } else {
      setSelectedRealm(realm);
      setSelectedSport(null);
    }
  };

  const handleSelectSport = (sport: SportCategory) => {
    selection();
    if (selectedSport === sport) {
      setSelectedSport(null);
    } else {
      setSelectedSport(sport);
    }
  };

  const handleGeneratePackage = () => {
    tap();
    setIsGeneratingPlan(true);
    setTimeout(() => {
      const plan = generateDestinationActionPackages(
        destination || "St. Moritz Athletic Sanctuary",
        tourDays,
        radiusKm,
        tourRealms
      );
      setGeneratedPlan(plan);
      setIsGeneratingPlan(false);
      success();
    }, 450);
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
        {/* Brand Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ paddingHorizontal: Spacing.xl, marginBottom: 18 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: Colors.olive,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2.5,
              }}
            >
              ENDORPHIX ATHLETIC
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
            Discover.
          </Text>
        </MotiView>

        {/* Discrete After-Activity Alert Pill */}
        {pendingBooking && (
          <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 14 }}>
            <TouchableOpacity
              onPress={() => {
                tap();
                openEnergyLoggingForBooking(pendingBooking);
                router.push(`/energy/modal?bookingId=${pendingBooking.id}`);
              }}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.terracotta + "16",
                borderWidth: 1,
                borderColor: Colors.terracotta + "44",
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.terracotta }} />
                <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700" }}>
                  {pendingBooking.activity_name} completed 30m ago · Slide Energy
                </Text>
              </View>
              <Text style={{ color: Colors.terracotta, fontSize: 12, fontWeight: "800" }}>
                Rate →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dual-Path Mode Toggle */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 20 }}>
          <SearchModeToggle />
        </View>

        {/* ─── PATH 1: SPORT-FIRST ─── */}
        {searchMode === "sport-first" ? (
          <View>
            {/* Macro Sport Realms Selector (Water, Land, Mountain) */}
            <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 14 }}>
              <Text
                style={{
                  color: Colors.espressoMuted,
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1.5,
                  marginBottom: 10,
                }}
              >
                SELECT REALM (WATER · LAND · MOUNTAIN)
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {MACRO_REALMS.map((realm) => {
                  const isSelected = selectedRealm === realm.id;
                  return (
                    <TouchableOpacity
                      key={realm.id}
                      onPress={() => handleSelectRealm(realm.id)}
                      activeOpacity={0.85}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? realm.accent : Colors.sand,
                        borderRadius: 14,
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: isSelected ? realm.accent : Colors.sandDark,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? Colors.chalk : Colors.espresso,
                          fontSize: 13,
                          fontWeight: "800",
                          letterSpacing: 0.5,
                        }}
                      >
                        {realm.label}
                      </Text>
                      <Text
                        style={{
                          color: isSelected ? Colors.sandLight : Colors.espressoMuted,
                          fontSize: 9.5,
                          fontWeight: "600",
                          marginTop: 2,
                        }}
                      >
                        {realm.id === "water" ? "Aquatic" : realm.id === "mountain" ? "Vertical" : "Country Club"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* All Sports Categories Horizontal Row */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  paddingHorizontal: Spacing.xl,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: Colors.espressoMuted,
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1.5,
                  }}
                >
                  ALL SPORT CATEGORIES
                </Text>
                {selectedSport && (
                  <TouchableOpacity onPress={() => setSelectedSport(null)}>
                    <Text style={{ color: Colors.olive, fontSize: 11, fontWeight: "700" }}>
                      Clear Filter ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: 8 }}
              >
                {ALL_SPORTS.filter(
                  (s) => !selectedRealm || s.realm === selectedRealm
                ).map((item) => {
                  const isSelected = selectedSport === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => handleSelectSport(item.value)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: isSelected ? Colors.olive : Colors.softChalk,
                        paddingHorizontal: 13,
                        paddingVertical: 9,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? Colors.olive : Colors.sandDark,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                      <Text
                        style={{
                          color: isSelected ? Colors.chalk : Colors.espresso,
                          fontSize: 12.5,
                          fontWeight: isSelected ? "800" : "600",
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Proximity Radius Selector */}
            <View
              style={{
                paddingHorizontal: Spacing.xl,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: Colors.espressoFaint,
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1.5,
                }}
              >
                PROXIMITY RADIUS
              </Text>

              <View style={{ flexDirection: "row", gap: 6 }}>
                {[10, 25, 50].map((km) => {
                  const isCurrent = radiusKm === km;
                  return (
                    <TouchableOpacity
                      key={km}
                      onPress={() => {
                        selection();
                        setRadiusKm(km);
                      }}
                      style={{
                        backgroundColor: isCurrent ? Colors.navy : Colors.sand,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isCurrent ? Colors.navy : Colors.sandDark,
                      }}
                    >
                      <Text
                        style={{
                          color: isCurrent ? Colors.chalk : Colors.espresso,
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {km}km
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Facilities List */}
            <View style={{ paddingHorizontal: Spacing.xl }}>
              {/* Dynamic Athletic Valuation & Order Metrics */}
              {bookings.length > 0 && (
                <SportAthleticStats
                  bookings={bookings}
                  selectedSport={selectedSport}
                  onSelectSport={(sport) => {
                    tap();
                    if (selectedSport === sport) {
                      setSelectedSport(null);
                    } else {
                      setSelectedSport(sport);
                    }
                  }}
                />
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: Colors.espresso,
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                >
                  Verified Facilities Within {radiusKm}km
                </Text>
                <Text style={{ color: Colors.olive, fontSize: 11, fontWeight: "700" }}>
                  {facilities?.length || 0} VENUES
                </Text>
              </View>

              {isLoading ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator color={Colors.olive} size="large" />
                  <Text
                    style={{
                      color: Colors.espressoMuted,
                      fontSize: 13,
                      fontWeight: "600",
                      marginTop: 10,
                    }}
                  >
                    Querying OpenStreetMap & PostGIS...
                  </Text>
                </View>
              ) : facilities && facilities.length > 0 ? (
                facilities.map((fac) => (
                  <FacilityCard
                    key={fac.id}
                    facility={fac}
                    onPress={() => {
                      tap();
                      router.push(`/facility/${fac.id}`);
                    }}
                  />
                ))
              ) : (
                <View
                  style={{
                    backgroundColor: Colors.sand,
                    borderRadius: 16,
                    padding: 24,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.espresso,
                      fontSize: 15,
                      fontWeight: "700",
                      textAlign: "center",
                      marginBottom: 6,
                    }}
                  >
                    No venues found in this realm radius.
                  </Text>
                  <Text
                    style={{
                      color: Colors.espressoMuted,
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 14,
                    }}
                  >
                    Expand your radius to 50km or select all realms.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setRadiusKm(50);
                      setSelectedRealm(null);
                      setSelectedSport(null);
                    }}
                    style={{
                      backgroundColor: Colors.olive,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: Colors.chalk, fontSize: 12, fontWeight: "800" }}>
                      Reset to 50km All Realms
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* ─── PATH 2: DESTINATION-FIRST ─── */
          <View style={{ paddingHorizontal: Spacing.xl }}>
            {/* Input Card */}
            <View
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                DESTINATION / ATHLETIC RETREAT
              </Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g. St. Moritz, Engadin, Wimbledon, Monaco"
                placeholderTextColor={Colors.espressoFaint}
                style={{
                  backgroundColor: Colors.softChalk,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  color: Colors.espresso,
                  fontSize: 14.5,
                  fontWeight: "600",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  marginBottom: 16,
                }}
              />

              {/* Days of Stay Selector */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.espresso,
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 0.5,
                    }}
                  >
                    DURATION OF STAY
                  </Text>
                  <Text style={{ color: Colors.olive, fontSize: 13, fontWeight: "800" }}>
                    {tourDays} DAYS
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[1, 2, 3, 5, 7].map((d) => {
                    const isSelected = tourDays === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => {
                          selection();
                          setTourDays(d);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: isSelected ? Colors.olive : Colors.softChalk,
                          paddingVertical: 10,
                          borderRadius: 10,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.olive : Colors.sandDark,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? Colors.chalk : Colors.espresso,
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          {d}d
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                onPress={handleGeneratePackage}
                activeOpacity={0.88}
                style={{
                  backgroundColor: Colors.navy,
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: Colors.chalk, fontSize: 14, fontWeight: "800", letterSpacing: 0.5 }}>
                  {isGeneratingPlan ? "Architecting Action Package..." : "Generate Tailored Action Package →"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Generated Tour Plan Output */}
            {generatedPlan && (
              <MotiView
                from={{ opacity: 0, translateY: 14 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 450 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: Colors.espressoFaint,
                        fontSize: 10,
                        fontWeight: "800",
                        letterSpacing: 2,
                      }}
                    >
                      TAILORED MULTI-DAY ITINERARY
                    </Text>
                    <Text style={{ color: Colors.espresso, fontSize: 20, fontWeight: "800" }}>
                      {generatedPlan.destination}
                    </Text>
                  </View>
                </View>

                {generatedPlan.tour_days.map((day) => (
                  <View
                    key={day.day}
                    style={{
                      backgroundColor: Colors.sand,
                      borderRadius: 18,
                      padding: 18,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: Colors.sandDark,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.olive,
                          fontSize: 12,
                          fontWeight: "800",
                          letterSpacing: 1.5,
                        }}
                      >
                        DAY {day.day} · {day.theme.toUpperCase()}
                      </Text>
                    </View>

                    {day.activities.map((act, actIdx) => (
                      <View
                        key={actIdx}
                        style={{
                          backgroundColor: Colors.softChalk,
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: actIdx < day.activities.length - 1 ? 8 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: act.intensity === "High" ? Colors.terracotta : Colors.olive,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.espresso,
                              fontSize: 13,
                              fontWeight: "800",
                            }}
                          >
                            {act.title}
                          </Text>
                          <View
                            style={{
                              backgroundColor: Colors.sand,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  act.intensity === "High"
                                    ? Colors.terracotta
                                    : Colors.olive,
                                fontSize: 9,
                                fontWeight: "800",
                              }}
                            >
                              {act.intensity.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={{
                            color: Colors.espressoMuted,
                            fontSize: 12,
                            lineHeight: 17,
                            marginBottom: 8,
                          }}
                        >
                          {act.description}
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            tap();
                            router.push(`/facility/${act.facility.id}`);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.olive,
                              fontSize: 11,
                              fontWeight: "700",
                            }}
                          >
                            View Venue ({act.facility.name}) →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </MotiView>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
