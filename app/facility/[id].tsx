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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useFacilityDetail } from "@/hooks/useFacilities";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { LiveBadge } from "@/components/LiveBadge";
import { TimetableCard } from "@/components/TimetableCard";
import { Colors, Spacing } from "@/constants";

const { height: SCREEN_H } = Dimensions.get("window");

const SAMPLE_SLOTS = [
  { start: "14:00", end: "15:00", label: "Court 1 (Clay)" },
  { start: "15:00", end: "16:00", label: "Court 2 (Hard)" },
  { start: "17:00", end: "18:00", label: "Court 1 (Clay)" },
  { start: "19:00", end: "20:00", label: "Center Court" },
];

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tap, confirm, success } = useHaptics();
  const { createBooking } = useBookingStore();

  const { data: facility, isLoading, error } = useFacilityDetail(id);

  const [selectedSportIndex, setSelectedSportIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(SAMPLE_SLOTS[0]);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const handleGoBack = () => {
    tap();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleReserve = () => {
    confirm();
    if (!facility) return;

    const chosenSport = facility.primary_sports[selectedSportIndex] || "tennis";
    const titleFormatted = chosenSport.charAt(0).toUpperCase() + chosenSport.slice(1);

    const booking = createBooking({
      facility_id: facility.id,
      facility_name: facility.name,
      activity_name: titleFormatted,
      activity_type: chosenSport as any,
      court_or_slot: selectedSlot.label,
      date: "Today",
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
    });

    success();
    setBookedSuccess(true);

    if (Platform.OS === "web") {
      window.alert(
        `Court Reserved!\n${facility.name}\n${titleFormatted} • ${selectedSlot.start}-${selectedSlot.end} (${selectedSlot.label})\n\nA notification will be sent 30 minutes after completion asking you to slide your energy level.`
      );
    }
  };

  const handleCall = () => {
    confirm();
    if (facility?.phone) {
      Linking.openURL(`tel:${facility.phone}`);
    }
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
          backgroundColor: Colors.obsidian,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={Colors.glow} size="large" />
      </View>
    );
  }

  if (error || !facility) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.obsidian,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Text style={{ color: Colors.danger, fontSize: 15, textAlign: "center" }}>
          Could not load facility details.
        </Text>
        <TouchableOpacity onPress={handleGoBack} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.glow }}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Immersive Header */}
        <View
          style={{
            height: SCREEN_H * 0.35,
            backgroundColor: Colors.surface,
            justifyContent: "flex-end",
            padding: Spacing.lg,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            activeOpacity={0.7}
            style={{
              position: "absolute",
              top: 54,
              left: Spacing.lg,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.void,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              elevation: 5,
            }}
          >
            <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>←</Text>
          </TouchableOpacity>

          {/* Live Badge */}
          {facility.is_live && (
            <View style={{ position: "absolute", top: 54, right: Spacing.lg }}>
              <LiveBadge count={facility.live_count} />
            </View>
          )}

          {/* Sport Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {facility.primary_sports.map((sport) => (
              <View
                key={sport}
                style={{
                  marginRight: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  backgroundColor: Colors.glow + "33",
                }}
              >
                <Text
                  style={{
                    color: Colors.glow,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 2,
                  }}
                >
                  {sport.toUpperCase()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text
            style={{ color: Colors.primary, fontSize: 26, fontWeight: "800" }}
          >
            {facility.name}
          </Text>
          <Text style={{ color: Colors.secondary, fontSize: 13, marginTop: 4 }}>
            {facility.address}
          </Text>
        </View>

        {/* Body */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450 }}
          style={{ paddingHorizontal: Spacing.lg, paddingTop: 24 }}
        >
          {/* Rating Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: Colors.glow, fontSize: 22, fontWeight: "800" }}>
              {facility.rating.toFixed(1)}
            </Text>
            <Text style={{ color: Colors.tertiary, fontSize: 13 }}>
              / 5.0 · {facility.review_count} reviews
            </Text>
            {facility.distance_meters !== undefined && (
              <Text
                style={{
                  marginLeft: "auto",
                  color: Colors.secondary,
                  fontSize: 12,
                }}
              >
                {(facility.distance_meters / 1000).toFixed(1)} km
              </Text>
            )}
          </View>

          {/* Description */}
          {facility.description && (
            <Text
              style={{
                color: Colors.secondary,
                fontSize: 14,
                lineHeight: 22,
                marginBottom: 28,
              }}
            >
              {facility.description}
            </Text>
          )}

          {/* Court & Activity Reservation Section */}
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: bookedSuccess ? Colors.success : Colors.border,
              marginBottom: 28,
            }}
          >
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
                  color: Colors.spark,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                }}
              >
                RESERVE COURT / SESSION
              </Text>
              {bookedSuccess && (
                <View
                  style={{
                    backgroundColor: Colors.success + "22",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: Colors.success, fontSize: 10, fontWeight: "700" }}>
                    ✓ RESERVED
                  </Text>
                </View>
              )}
            </View>

            {/* Sport selection */}
            <Text style={{ color: Colors.secondary, fontSize: 11, marginBottom: 8 }}>
              SELECT DISCIPLINE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {facility.primary_sports.map((sp, idx) => (
                <TouchableOpacity
                  key={sp}
                  onPress={() => { tap(); setSelectedSportIndex(idx); }}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: selectedSportIndex === idx ? Colors.glow : Colors.elevated,
                  }}
                >
                  <Text
                    style={{
                      color: selectedSportIndex === idx ? Colors.obsidian : Colors.secondary,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {sp.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time Slot selection */}
            <Text style={{ color: Colors.secondary, fontSize: 11, marginBottom: 8 }}>
              SELECT TIME SLOT (TODAY)
            </Text>
            <View style={{ gap: 6, marginBottom: 16 }}>
              {SAMPLE_SLOTS.map((slot) => {
                const isSelected = selectedSlot.start === slot.start && selectedSlot.end === slot.end;
                return (
                  <TouchableOpacity
                    key={slot.start + slot.end}
                    onPress={() => { tap(); setSelectedSlot(slot); }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: isSelected ? Colors.glow + "20" : Colors.elevated,
                      borderWidth: 1,
                      borderColor: isSelected ? Colors.glow : Colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? Colors.glow : Colors.primary,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {slot.start} – {slot.end}
                    </Text>
                    <Text style={{ color: isSelected ? Colors.glow : Colors.tertiary, fontSize: 12 }}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirmation Note */}
            <Text
              style={{
                color: Colors.tertiary,
                fontSize: 11,
                lineHeight: 16,
                marginBottom: 14,
              }}
            >
              • 30 minutes after your {selectedSlot.start}-{selectedSlot.end} session completes, Endorphix will push a notification to slide and record your somatic energy level.
            </Text>

            {/* Reserve Button */}
            <TouchableOpacity
              onPress={handleReserve}
              activeOpacity={0.85}
              style={{
                backgroundColor: bookedSuccess ? Colors.success : Colors.glow,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.obsidian,
                  fontSize: 13,
                  fontWeight: "800",
                  letterSpacing: 1.2,
                }}
              >
                {bookedSuccess ? "RESERVE ANOTHER SLOT" : `RESERVE ${selectedSlot.start} - ${selectedSlot.end}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timetable */}
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            HOURS
          </Text>
          <TimetableCard timetable={facility.timetable} />

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
            {facility.phone && (
              <TouchableOpacity
                onPress={handleCall}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: "600" }}>
                  📞 Call
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDirections}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: Colors.glow,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.obsidian,
                  fontSize: 13,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                ↗ Directions
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
