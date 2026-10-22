import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MotiView } from "moti";
import { useEnergyWave, useLogEnergy } from "@/hooks/useEnergy";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { EnergyWaveChart } from "@/components/EnergyWaveChart";
import { Colors, Spacing } from "@/constants";
import type { Booking } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);

export default function EnergyScreen() {
  const router = useRouter();
  const { selection, success, error: errorHaptic, confirm } = useHaptics();
  const { bookings, activeBookingToLog, openEnergyLoggingForBooking, markEnergyLogged } =
    useBookingStore();

  const [energyScore, setEnergyScore] = useState(72);
  const [notes, setNotes] = useState("");
  const [waveDays, setWaveDays] = useState(30);

  const { data: waveData } = useEnergyWave(waveDays);
  const { mutate: logEnergy, isPending } = useLogEnergy();

  // Slider gesture shared value
  const sliderX = useSharedValue((72 / 100) * SLIDER_WIDTH);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
  }));

  const updateScoreFromX = (xPos: number) => {
    const clampedX = Math.max(0, Math.min(SLIDER_WIDTH, xPos));
    sliderX.value = clampedX;
    const newScore = Math.max(1, Math.min(100, Math.round((clampedX / SLIDER_WIDTH) * 100)));
    setEnergyScore(newScore);
  };

  const panGesture = Gesture.Pan().onUpdate((e) => {
    const newX = Math.max(0, Math.min(SLIDER_WIDTH, e.x));
    sliderX.value = newX;
    const newScore = Math.max(1, Math.min(100, Math.round((newX / SLIDER_WIDTH) * 100)));
    runOnJS(setEnergyScore)(newScore);
    if (newScore % 10 === 0) runOnJS(selection)();
  });

  const handleSelectBooking = (booking: Booking) => {
    confirm();
    openEnergyLoggingForBooking(booking);
    setEnergyScore(72);
    sliderX.value = (72 / 100) * SLIDER_WIDTH;
  };

  const handleSaveEnergyLog = () => {
    if (!activeBookingToLog) return;

    const currentBooking = activeBookingToLog;
    logEnergy(
      {
        activity_type: currentBooking.activity_type,
        energy_score: energyScore,
        duration_minutes: 60,
        facility_id: currentBooking.facility_id,
        notes: notes || `Post-session energy rating for ${currentBooking.activity_name} (${currentBooking.start_time}-${currentBooking.end_time})`,
      },
      {
        onSuccess: () => {
          success();
          markEnergyLogged(currentBooking.id, energyScore);
          if (Platform.OS === "web") {
            window.alert(
              `Somatic Energy Saved!\n${currentBooking.activity_name} session (${currentBooking.start_time}-${currentBooking.end_time}) registered at ${energyScore}/100 in your Vitality Passport history.`
            );
          }
          setNotes("");
        },
        onError: () => errorHaptic(),
      }
    );
  };

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const loggedBookings = bookings.filter((b) => b.status === "energy_logged");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
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
          POST-RESERVATION PULSE
        </Text>
        <Text style={{ color: Colors.primary, fontSize: 32, fontWeight: "800" }}>
          Somatic Energy Bar
        </Text>
        <Text style={{ color: Colors.secondary, fontSize: 13, marginTop: 6, lineHeight: 20 }}>
          The energy slider activates 30 minutes after your reserved court or activity session finishes.
        </Text>
      </MotiView>

      {/* ─── DYNAMIC ENERGY SLIDER BAR (Appears ONLY when user taps notification or completed reservation) ─── */}
      {activeBookingToLog ? (
        <MotiView
          from={{ opacity: 0, scale: 0.96, translateY: -10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 16 }}
          style={{
            marginHorizontal: Spacing.lg,
            marginBottom: 28,
            backgroundColor: Colors.surface,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1.5,
            borderColor: Colors.glow,
            shadowColor: Colors.glow,
            shadowOpacity: 0.3,
            shadowRadius: 14,
          }}
        >
          {/* Reservation Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: Colors.glow + "25",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    color: Colors.glow,
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 1.2,
                  }}
                >
                  ⚡ NOTIFICATION TRIGGERED · 30M POST-SESSION
                </Text>
              </View>

              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 20,
                  fontWeight: "800",
                }}
              >
                {activeBookingToLog.activity_name} · {activeBookingToLog.start_time} - {activeBookingToLog.end_time}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 13, marginTop: 2 }}>
                {activeBookingToLog.facility_name} ({activeBookingToLog.court_or_slot})
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => useBookingStore.getState().openEnergyLoggingForBooking(null as any)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: Colors.elevated,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 10,
              }}
            >
              <Text style={{ color: Colors.secondary, fontSize: 13, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Energy Score Readout */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
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
              RECORD YOUR ENERGY
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
              <Text
                style={{
                  color: Colors.glow,
                  fontSize: 42,
                  fontWeight: "800",
                  lineHeight: 46,
                }}
              >
                {energyScore}
              </Text>
              <Text style={{ color: Colors.tertiary, fontSize: 14, fontWeight: "600" }}>
                / 100
              </Text>
            </View>
          </View>

          {/* Tactile Slider Track */}
          <GestureDetector gesture={panGesture}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => updateScoreFromX(e.nativeEvent.locationX)}
              style={{
                width: "100%",
                height: 40,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 8,
                  backgroundColor: Colors.muted,
                  borderRadius: 4,
                  position: "relative",
                  overflow: "visible",
                }}
              >
                {/* Active Fill */}
                <Animated.View
                  style={[
                    {
                      height: 8,
                      backgroundColor: Colors.glow,
                      borderRadius: 4,
                      position: "absolute",
                      left: 0,
                      top: 0,
                    },
                    useAnimatedStyle(() => ({ width: sliderX.value })),
                  ]}
                />
                {/* Thumb */}
                <Animated.View
                  style={[
                    {
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: Colors.glow,
                      borderWidth: 3,
                      borderColor: Colors.obsidian,
                      position: "absolute",
                      top: -10,
                      left: -14,
                      shadowColor: Colors.glow,
                      shadowOpacity: 0.6,
                      shadowRadius: 8,
                    },
                    thumbStyle,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </GestureDetector>

          {/* Anchors */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: Colors.tertiary, fontSize: 10 }}>1 Exhausted</Text>
            <Text style={{ color: Colors.tertiary, fontSize: 10 }}>50 Balanced</Text>
            <Text style={{ color: Colors.spark, fontSize: 10, fontWeight: "700" }}>100 Peak Endorphin</Text>
          </View>

          {/* Optional notes */}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={`How did your ${activeBookingToLog.activity_name} session feel? (e.g., tough match, high sprint volume)…`}
            placeholderTextColor={Colors.tertiary}
            style={{
              backgroundColor: Colors.elevated,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              color: Colors.primary,
              fontSize: 13,
              marginBottom: 16,
            }}
          />

          {/* Save Action */}
          <TouchableOpacity
            onPress={handleSaveEnergyLog}
            disabled={isPending}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.glow,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: Colors.obsidian,
                fontSize: 14,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              {isPending ? "SAVING..." : "COMMIT TO VITALITY PASSPORT"}
            </Text>
          </TouchableOpacity>
        </MotiView>
      ) : (
        /* Status Card when waiting for an activity to finish */
        <View
          style={{
            marginHorizontal: Spacing.lg,
            marginBottom: 24,
            padding: 18,
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            borderStyle: "dashed",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Text style={{ fontSize: 20 }}>🎾</Text>
            <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: "700" }}>
              Awaiting Activity Completion
            </Text>
          </View>
          <Text style={{ color: Colors.secondary, fontSize: 13, lineHeight: 19 }}>
            Book a court or facility in the Discover tab. Exactly 30 minutes after your booked time window closes (e.g. 14:00–15:00), the app sends a notification to slide and save your energy.
          </Text>
        </View>
      )}

      {/* ─── RESERVED ACTIVITY SESSIONS ─── */}
      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: 28 }}>
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          YOUR RESERVED SESSIONS
        </Text>

        <View style={{ gap: 10 }}>
          {completedBookings.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => handleSelectBooking(b)}
              activeOpacity={0.85}
              style={{
                backgroundColor: activeBookingToLog?.id === b.id ? Colors.elevated : Colors.surface,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1.5,
                borderColor: activeBookingToLog?.id === b.id ? Colors.glow : "#EAB308",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#EAB30825",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#FACC15", fontSize: 10, fontWeight: "800" }}>
                    NOTIFICATION READY (30M POST-SESSION)
                  </Text>
                </View>

                <Text style={{ color: Colors.glow, fontSize: 12, fontWeight: "700" }}>
                  SLIDE ENERGY →
                </Text>
              </View>

              <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: "800" }}>
                {b.activity_name} · {b.start_time} - {b.end_time}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 12, marginTop: 2 }}>
                {b.facility_name} ({b.court_or_slot})
              </Text>
            </TouchableOpacity>
          ))}

          {confirmedBookings.map((b) => (
            <View
              key={b.id}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.elevated,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: Colors.secondary, fontSize: 10, fontWeight: "700" }}>
                    CONFIRMED RESERVATION
                  </Text>
                </View>

                <Text style={{ color: Colors.tertiary, fontSize: 11 }}>
                  Notif in 30m after finish
                </Text>
              </View>

              <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: "800" }}>
                {b.activity_name} · {b.start_time} - {b.end_time}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 12, marginTop: 2 }}>
                {b.facility_name} ({b.court_or_slot})
              </Text>
            </View>
          ))}

          {loggedBookings.map((b) => (
            <View
              key={b.id}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                opacity: 0.85,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.success + "22",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: Colors.success, fontSize: 10, fontWeight: "700" }}>
                    ✓ ENERGY RECORDED
                  </Text>
                </View>

                <Text style={{ color: Colors.glow, fontSize: 15, fontWeight: "800" }}>
                  Score: {b.logged_energy_score}/100
                </Text>
              </View>

              <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: "700" }}>
                {b.activity_name} · {b.start_time} - {b.end_time}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 12, marginTop: 2 }}>
                {b.facility_name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── SOMATIC ENERGY WAVE TIME-SERIES ─── */}
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
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
            SOMATIC ENERGY WAVE (PROFILE SYNC)
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[7, 14, 30].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  selection();
                  setWaveDays(d);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  backgroundColor: waveDays === d ? Colors.elevated : "transparent",
                }}
              >
                <Text
                  style={{
                    color: waveDays === d ? Colors.pulse : Colors.tertiary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <EnergyWaveChart data={waveData ?? []} />
      </View>
    </ScrollView>
    </View>
  );
}
