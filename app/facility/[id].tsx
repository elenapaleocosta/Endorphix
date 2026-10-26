import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useFacilityDetail } from "@/hooks/useFacilities";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { TimetableCard } from "@/components/TimetableCard";
import { showAlert } from "@/lib/alert";
import { Colors, Spacing } from "@/constants";

const { height: SCREEN_H } = Dimensions.get("window");

const SAMPLE_SLOTS = [
  { start: "07:30", end: "08:30", label: "Center Court (Clay)" },
  { start: "14:00", end: "15:00", label: "Court 1 (Grass / Lawn)" },
  { start: "16:30", end: "17:30", label: "Court 2 (Clay)" },
  { start: "18:00", end: "19:00", label: "Olympic Lap Lane 4" },
];

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tap, confirm, success } = useHaptics();
  const { createBooking, simulate30MinutesPostSession } = useBookingStore();

  const { data: facility, isLoading, error } = useFacilityDetail(id || "fac-heritage-1");

  const [selectedSportIndex, setSelectedSportIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(SAMPLE_SLOTS[0]);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [showWebModal, setShowWebModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleGoBack = () => {
    tap();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/discover");
    }
  };

  const handleReserve = () => {
    confirm();
    if (!facility) return;

    const chosenSport = facility.primary_sports[selectedSportIndex] || "tennis";
    const titleFormatted = chosenSport.charAt(0).toUpperCase() + chosenSport.slice(1);

    const newBooking = createBooking({
      facility_id: facility.id,
      facility_name: facility.name,
      activity_name: titleFormatted,
      activity_type: (chosenSport === "tennis" ? "tennis" : chosenSport === "running" ? "run" : chosenSport === "swimming" ? "swim" : chosenSport === "cycling" ? "cycle" : chosenSport === "climbing" ? "climb" : chosenSport === "hiking" ? "hike" : chosenSport === "football" ? "soccer" : chosenSport === "basketball" ? "basketball" : "court") as any,
      sport_category: chosenSport,
      court_or_slot: selectedSlot.label,
      date: "Today",
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
    });

    setLastBookingId(newBooking.id);
    success();
    setBookedSuccess(true);

    showAlert(
      "Court Reserved",
      `${facility.name}\n${titleFormatted} • ${selectedSlot.start}-${selectedSlot.end} (${selectedSlot.label})\n\nAn in-phone notification will trigger 30 minutes after completion asking you to slide your somatic energy level.`
    );
  };

  const handleCall = () => {
    confirm();
    if (facility?.phone) {
      Linking.openURL(`tel:${facility.phone}`);
    } else {
      showAlert("Contact", "Phone line unavailable for this facility.");
    }
  };

  const handleWebsite = () => {
    confirm();
    setShowWebModal(true);
  };

  const openGoogleMaps = () => {
    confirm();
    setShowWebModal(false);
    if (!facility) return;
    const { latitude, longitude } = facility.location;
    const label = encodeURIComponent(facility.name);
    // Standard Google Maps web/app URL that works seamlessly across all platforms & devices
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${facility.google_place_id || ""}`;
    Linking.openURL(googleMapsUrl);
  };

  const openActivityInfo = () => {
    confirm();
    setShowWebModal(false);
    setShowInfoModal(true);
  };

  const handleDirections = () => {
    confirm();
    if (!facility) return;
    const { latitude, longitude } = facility.location;
    const label = encodeURIComponent(facility.name);
    const url =
      Platform.OS === "ios"
        ? `maps:?q=${label}&ll=${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${label}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.chalk,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={Colors.olive} size="large" />
      </View>
    );
  }

  if (error || !facility) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.chalk,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: Spacing.xl,
        }}
      >
        <Text style={{ color: Colors.terracotta, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
          Could not load facility details.
        </Text>
        <TouchableOpacity onPress={handleGoBack} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.olive, fontWeight: "800" }}>← Return to Discover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const distanceKm =
    facility.distance_meters !== undefined
      ? (facility.distance_meters / 1000).toFixed(1)
      : "1.4";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Area */}
        <View
          style={{
            backgroundColor: Colors.sand,
            paddingTop: Platform.OS === "ios" ? 54 : 40,
            paddingBottom: 24,
            paddingHorizontal: Spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: Colors.sandDark,
          }}
        >
          {/* Top Bar with Back Button and Live Badge */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleGoBack}
              activeOpacity={0.8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.softChalk,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 18, fontWeight: "700" }}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3.5,
                borderRadius: 6,
                backgroundColor: Colors.camel + "22",
                borderWidth: 1,
                borderColor: Colors.camel + "44",
              }}
            >
              <Text style={{ color: Colors.camel, fontSize: 10, fontWeight: "800" }}>
                REALM: {facility.macro_realm?.toUpperCase() || "LAND"}
              </Text>
            </View>

            {facility.primary_sports.map((sport) => (
              <View
                key={sport}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3.5,
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

          {/* Title */}
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 28,
              fontWeight: "800",
              letterSpacing: -0.6,
              lineHeight: 34,
              marginBottom: 6,
            }}
          >
            {facility.name}
          </Text>

          {/* Address & Proximity */}
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {facility.address} · <Text style={{ color: Colors.olive, fontWeight: "700" }}>{distanceKm} km from you</Text>
          </Text>

          {/* Quick Contact & Navigation Row */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              onPress={handleDirections}
              style={{
                flex: 1,
                backgroundColor: Colors.olive,
                borderRadius: 12,
                paddingVertical: 11,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Text style={{ color: Colors.chalk, fontSize: 12, fontWeight: "800" }}>
                Route Map ↗
              </Text>
            </TouchableOpacity>

            {facility.phone && (
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  backgroundColor: Colors.softChalk,
                  borderRadius: 12,
                  paddingVertical: 11,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700" }}>
                  Call Venue 📞
                </Text>
              </TouchableOpacity>
            )}

            {facility.website && (
              <TouchableOpacity
                onPress={handleWebsite}
                style={{
                  backgroundColor: Colors.softChalk,
                  borderRadius: 12,
                  paddingVertical: 11,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700" }}>
                  Web 🌐
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Overview Section */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: 20, marginBottom: 22 }}>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            OVERVIEW & ATHLETIC STANDARD
          </Text>
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 14.5,
              lineHeight: 22,
              fontWeight: "500",
            }}
          >
            {facility.description ||
              "Premier championship athletic grounds built for sustained aerobic conditioning and somatic recovery."}
          </Text>
        </View>

        {/* ─── "Expand Your Energy" Section (Mandatory Spec) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 24 }}>
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
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              EXPAND YOUR ENERGY PROTOCOLS
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {(facility.expand_activities || [
              {
                id: "def-1",
                title: "Nordic Contrast Plunge & Dry Sauna",
                category: "recovery",
                durationMinutes: 45,
                description: "3°C cold plunge paired with 85°C heat chamber for rapid lactic acid and lymphatic clearance.",
              },
              {
                id: "def-2",
                title: "Cadence Drill & Dynamic Movement Flush",
                category: "endurance",
                durationMinutes: 30,
                description: "High-cadence mobility and stride activation on turf.",
              },
            ]).map((activity) => (
              <View
                key={activity.id}
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  borderLeftWidth: 3.5,
                  borderLeftColor:
                    activity.category === "recovery"
                      ? Colors.camel
                      : Colors.olive,
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
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    {activity.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: Colors.softChalk,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.espresso,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {activity.durationMinutes} MIN
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: Colors.espressoMuted,
                    fontSize: 12.5,
                    lineHeight: 18,
                  }}
                >
                  {activity.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Reserve Court / Slot Section ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 24 }}>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            SELECT SLOT · LOCK IN CADENCE
          </Text>

          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: Colors.sandDark,
            }}
          >
            <View style={{ gap: 8, marginBottom: 16 }}>
              {SAMPLE_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot.label + slot.start}
                    onPress={() => {
                      tap();
                      setSelectedSlot(slot);
                    }}
                    style={{
                      backgroundColor: isSelected ? Colors.olive : Colors.softChalk,
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: isSelected ? Colors.olive : Colors.sandDark,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? Colors.chalk : Colors.espresso,
                        fontSize: 13,
                        fontWeight: "800",
                      }}
                    >
                      {slot.start} – {slot.end}
                    </Text>
                    <Text
                      style={{
                        color: isSelected ? Colors.sandLight : Colors.espressoMuted,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleReserve}
              activeOpacity={0.88}
              style={{
                backgroundColor: bookedSuccess ? Colors.olive : Colors.navy,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.chalk,
                  fontSize: 14,
                  fontWeight: "800",
                  letterSpacing: 0.5,
                }}
              >
                {bookedSuccess ? "✓ Slot Confirmed (30m Alert Set)" : "Reserve & Schedule Post-Activity Alert →"}
              </Text>
            </TouchableOpacity>

            {bookedSuccess && (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.softChalk,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              >
                <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>
                  ● 30m Post-Activity Protocol Active
                </Text>
                <Text style={{ color: Colors.espressoMuted, fontSize: 11.5, lineHeight: 16, marginBottom: 10 }}>
                  Half an hour after your {selectedSlot.start}–{selectedSlot.end} session, an in-phone alert will prompt you to slide your Endorphin Bar.
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    confirm();
                    simulate30MinutesPostSession(lastBookingId || undefined);
                    showAlert(
                      "30m Post-Activity Simulated",
                      "The 30-minute post-activity cool-down has elapsed. Notice the in-phone alert banner at the top of your screen! Tap it to open the After-Activity Energy Bar."
                    );
                  }}
                  style={{
                    backgroundColor: Colors.terracotta,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.chalk, fontSize: 12, fontWeight: "800" }}>
                    ⚡ Test 30m Post-Session Alert Now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Operating Hours Timetable */}
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            OPERATIONAL TIMETABLE
          </Text>
          <TimetableCard timetable={facility.timetable} />
        </View>
      </ScrollView>

      {/* ─── Modal 1: Choice Dialog when clicking "Web" ─── */}
      <Modal
        visible={showWebModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowWebModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(43, 31, 23, 0.65)",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 16,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: "100%",
              maxWidth: 480,
              backgroundColor: Colors.sand,
              borderRadius: 24,
              padding: 22,
              borderWidth: 1.5,
              borderColor: Colors.sandDark,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Modal Title */}
            <View style={{ alignItems: "center", marginBottom: 18 }}>
              <View
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.sandDark,
                  marginBottom: 14,
                }}
              />
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 18,
                  fontWeight: "800",
                  textAlign: "center",
                  letterSpacing: -0.3,
                }}
              >
                Activity & Destination Options
              </Text>
              <Text
                style={{
                  color: Colors.espressoMuted,
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Choose how you'd like to explore this activity
              </Text>
            </View>

            {/* Choice 1: Google Map for Destination */}
            <TouchableOpacity
              onPress={openGoogleMaps}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: Colors.olive + "18",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: Colors.olive + "33",
                }}
              >
                <Text style={{ fontSize: 22 }}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.espresso, fontSize: 15, fontWeight: "800", marginBottom: 2 }}>
                  Google Maps Destination
                </Text>
                <Text style={{ color: Colors.espressoMuted, fontSize: 12, lineHeight: 16 }}>
                  Open destination location, directions & satellite terrain in Google Maps
                </Text>
              </View>
              <Text style={{ color: Colors.olive, fontSize: 18, fontWeight: "700" }}>↗</Text>
            </TouchableOpacity>

            {/* Choice 2: Activity Information */}
            <TouchableOpacity
              onPress={openActivityInfo}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: Colors.camel + "18",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: Colors.camel + "33",
                }}
              >
                <Text style={{ fontSize: 22 }}>ℹ️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.espresso, fontSize: 15, fontWeight: "800", marginBottom: 2 }}>
                  Activity Information
                </Text>
                <Text style={{ color: Colors.espressoMuted, fontSize: 12, lineHeight: 16 }}>
                  Detailed athletic breakdown, amenities, timings & training protocols
                </Text>
              </View>
              <Text style={{ color: Colors.camel, fontSize: 18, fontWeight: "700" }}>→</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowWebModal(false)}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: "center",
                borderWidth: 1,
                borderColor: Colors.sandDark,
              }}
            >
              <Text style={{ color: Colors.espressoMuted, fontSize: 13.5, fontWeight: "700" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── Modal 2: Activity Information Details ─── */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(43, 31, 23, 0.7)",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "85%",
              backgroundColor: Colors.chalk,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 16,
              paddingHorizontal: Spacing.xl,
              paddingBottom: Platform.OS === "ios" ? 40 : 24,
              borderWidth: 1.5,
              borderColor: Colors.sandDark,
            }}
          >
            {/* Header Handle & Close */}
            <View style={{ alignItems: "center", marginBottom: 14 }}>
              <View
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.sandDark,
                  marginBottom: 12,
                }}
              />
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Colors.espresso,
                    fontSize: 20,
                    fontWeight: "800",
                    letterSpacing: -0.4,
                  }}
                >
                  Activity Details
                </Text>
                <TouchableOpacity
                  onPress={() => setShowInfoModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Colors.sand,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: Colors.espresso, fontSize: 14, fontWeight: "800" }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Activity & Venue Header */}
              <View
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: Colors.olive,
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 1.5,
                    marginBottom: 4,
                  }}
                >
                  SELECTED ACTIVITY & VENUE
                </Text>
                <Text style={{ color: Colors.espresso, fontSize: 18, fontWeight: "800", marginBottom: 4 }}>
                  {facility.name}
                </Text>
                <Text style={{ color: Colors.espressoMuted, fontSize: 13 }}>
                  {facility.address}
                </Text>
              </View>

              {/* Key Activity Metrics Grid */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.softChalk,
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  <Text style={{ color: Colors.espressoMuted, fontSize: 10, fontWeight: "700" }}>
                    SPORT REALM
                  </Text>
                  <Text style={{ color: Colors.camel, fontSize: 14, fontWeight: "800", marginTop: 2 }}>
                    {facility.macro_realm?.toUpperCase() || "LAND"}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.softChalk,
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  <Text style={{ color: Colors.espressoMuted, fontSize: 10, fontWeight: "700" }}>
                    DISTANCE
                  </Text>
                  <Text style={{ color: Colors.olive, fontSize: 14, fontWeight: "800", marginTop: 2 }}>
                    {distanceKm} km away
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.softChalk,
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  <Text style={{ color: Colors.espressoMuted, fontSize: 10, fontWeight: "700" }}>
                    RATING
                  </Text>
                  <Text style={{ color: Colors.terracotta, fontSize: 14, fontWeight: "800", marginTop: 2 }}>
                    ★ {facility.rating?.toFixed(1) || "4.9"}
                  </Text>
                </View>
              </View>

              {/* Sports Offered */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: Colors.espressoMuted,
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1.5,
                    marginBottom: 8,
                  }}
                >
                  SUPPORTED DISCIPLINES & SPORTS
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {facility.primary_sports.map((sport) => (
                    <View
                      key={sport}
                      style={{
                        backgroundColor: Colors.olive + "16",
                        borderWidth: 1,
                        borderColor: Colors.olive + "44",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: Colors.olive, fontSize: 12, fontWeight: "800" }}>
                        ✓ {sport.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {facility.secondary_sports?.map((sport) => (
                    <View
                      key={sport}
                      style={{
                        backgroundColor: Colors.softChalk,
                        borderWidth: 1,
                        borderColor: Colors.sandDark,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: Colors.espressoMuted, fontSize: 12, fontWeight: "700" }}>
                        {sport.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Description & Overview */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: Colors.espressoMuted,
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1.5,
                    marginBottom: 8,
                  }}
                >
                  ACTIVITY OVERVIEW
                </Text>
                <Text
                  style={{
                    color: Colors.espresso,
                    fontSize: 13.5,
                    lineHeight: 20,
                    fontWeight: "500",
                    backgroundColor: Colors.sand,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                >
                  {facility.description ||
                    "Premier championship athletic grounds built for sustained aerobic conditioning and somatic recovery."}
                </Text>
              </View>

              {/* Expand Energy Protocols */}
              {facility.expand_activities && facility.expand_activities.length > 0 && (
                <View style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      color: Colors.espressoMuted,
                      fontSize: 11,
                      fontWeight: "800",
                      letterSpacing: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    ON-SITE TRAINING & RECOVERY PROTOCOLS
                  </Text>
                  <View style={{ gap: 8 }}>
                    {facility.expand_activities.map((act) => (
                      <View
                        key={act.id}
                        style={{
                          backgroundColor: Colors.softChalk,
                          borderRadius: 12,
                          padding: 12,
                          borderLeftWidth: 3,
                          borderLeftColor: act.category === "recovery" ? Colors.camel : Colors.olive,
                          borderWidth: 1,
                          borderColor: Colors.sandDark,
                        }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                          <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                            {act.title}
                          </Text>
                          <Text style={{ color: Colors.espressoMuted, fontSize: 11, fontWeight: "600" }}>
                            {act.durationMinutes} min
                          </Text>
                        </View>
                        <Text style={{ color: Colors.espressoMuted, fontSize: 12, lineHeight: 16 }}>
                          {act.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons inside Info Modal */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={openGoogleMaps}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.olive,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ color: Colors.chalk, fontSize: 13, fontWeight: "800" }}>
                    📍 Open Google Map
                  </Text>
                </TouchableOpacity>

                {facility.website && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowInfoModal(false);
                      Linking.openURL(facility.website!);
                    }}
                    style={{
                      backgroundColor: Colors.softChalk,
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      borderWidth: 1,
                      borderColor: Colors.sandDark,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                      Visit Website 🌐
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
