import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useBookingStore } from "@/store/booking.store";
import { useAuthStore } from "@/store/auth.store";
import { useLogEnergy } from "@/hooks/useEnergy";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors, Spacing } from "@/constants";

function getSomaticState(score: number): { label: string; color: string; desc: string } {
  if (score >= 90) {
    return {
      label: "PEAK VITALITY HIGH",
      color: Colors.terracotta,
      desc: "Transcendent neuromuscular flow & euphoric endorphin flush.",
    };
  }
  if (score >= 75) {
    return {
      label: "HIGH EUPHORIC FLOW",
      color: Colors.olive,
      desc: "Elevated central nervous clarity, buoyant somatic lightness.",
    };
  }
  if (score >= 50) {
    return {
      label: "ACTIVE FLOW STATE",
      color: Colors.camel,
      desc: "Clean baseline activation, centered cardiovascular cadence.",
    };
  }
  if (score >= 25) {
    return {
      label: "GROUNDED & RESETTING",
      color: Colors.espressoMuted,
      desc: "Subdued neuromuscular state, tissue conditioning.",
    };
  }
  return {
    label: "SOMATIC DEPLETION",
    color: Colors.espressoFaint,
    desc: "Cellular replenishment & hydrotherapy recommended.",
  };
}

export default function AfterActivityEnergyModal() {
  const { isPhone, isTablet, isDesktop } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { selection, success, error: errorHaptic, confirm, tap } = useHaptics();
  const { user, updateUserProfile } = useAuthStore();
  const { bookings, activeBookingToLog, markEnergyLogged } = useBookingStore();
  const { mutate: logEnergy, isPending } = useLogEnergy();

  // Find target booking: from URL param, or activeBookingToLog, or latest completed booking
  const targetBooking =
    (params.bookingId ? bookings.find((b) => b.id === params.bookingId) : null) ||
    activeBookingToLog ||
    bookings.find((b) => b.status === "completed") ||
    bookings[0];

  const [energyScore, setEnergyScore] = useState(88);
  const [notes, setNotes] = useState("");

  const somatic = getSomaticState(energyScore);

  const handleAdjustScore = (delta: number) => {
    selection();
    setEnergyScore((prev) => Math.max(1, Math.min(100, prev + delta)));
  };

  const handlePresetSelect = (preset: number) => {
    confirm();
    setEnergyScore(preset);
  };

  const handleDismiss = () => {
    tap();
    router.back();
  };

  const handleSaveEnergyLog = () => {
    confirm();
    const state = getSomaticState(energyScore);

    logEnergy(
      {
        activity_type: targetBooking?.activity_type || "tennis",
        activity_title: targetBooking
          ? `${targetBooking.activity_name} (${targetBooking.start_time}-${targetBooking.end_time})`
          : "After-Activity Session",
        energy_score: energyScore,
        duration_minutes: 60,
        facility_id: targetBooking?.facility_id,
        facility_name: targetBooking?.facility_name,
        notes: notes || `${state.label} — ${state.desc}`,
        somatic_state: state.label,
      },
      {
        onSuccess: () => {
          success();
          if (targetBooking) {
            markEnergyLogged(targetBooking.id, energyScore);
          }
          if (user) {
            updateUserProfile({
              streak_current: user.streak_current + 1,
              lifetime_sessions: user.lifetime_sessions + 1,
            });
          }
          showAlert(
            "Endorphin High Recorded",
            `Somatic Energy registered at ${energyScore}/100 (${state.label}). Your Vitality Wave and consecutive streak have been elevated.`
          );
          router.back();
        },
        onError: () => errorHaptic(),
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 60,
          paddingTop: Platform.OS === "ios" ? 56 : 36,
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={640} noPadding>
        {/* Top Dismiss Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                color: Colors.terracotta,
                fontSize: 10.5,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            >
              AFTER-ACTIVITY SOMATIC PROTOCOL
            </Text>
            <Text
              style={{
                color: Colors.espresso,
                fontSize: 24,
                fontWeight: "800",
                letterSpacing: -0.6,
                marginTop: 2,
              }}
            >
              The Endorphin Bar
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.sand,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 16, fontWeight: "700" }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Target Session Card (Explicit 30m Post-Activity Context) ─── */}
        {targetBooking && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              borderLeftWidth: 4,
              borderLeftColor: Colors.olive,
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
              <Text
                style={{
                  color: Colors.olive,
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                COMPLETED SESSION · 30M RECOVERY WINDOW
              </Text>
              <View
                style={{
                  backgroundColor: Colors.terracotta + "18",
                  paddingHorizontal: 7,
                  paddingVertical: 2.5,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.terracotta + "44",
                }}
              >
                <Text style={{ color: Colors.terracotta, fontSize: 9.5, fontWeight: "800" }}>
                  COOL-DOWN FINISHED
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: Colors.espresso,
                fontSize: 17,
                fontWeight: "800",
                marginBottom: 2,
              }}
            >
              {targetBooking.facility_name}
            </Text>

            <Text style={{ color: Colors.espressoMuted, fontSize: 13, fontWeight: "600" }}>
              {targetBooking.activity_name} · {targetBooking.start_time}–{targetBooking.end_time} ({targetBooking.court_or_slot})
            </Text>
          </MotiView>
        )}

        {/* Somatic Context Instructions */}
        <Text
          style={{
            color: Colors.espressoMuted,
            fontSize: 13.5,
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          Half an hour post-movement, elevated heart rate subsides and neuromuscular endorphins peak. Slide your subjective somatic high on a 1–100 scale.
        </Text>

        {/* ─── Tactile Endorphin High Meter Card ─── */}
        <View
          style={{
            backgroundColor: Colors.sand,
            borderRadius: 18,
            padding: 20,
            borderWidth: 1,
            borderColor: Colors.sandDark,
            marginBottom: 20,
          }}
        >
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
                color: Colors.espressoFaint,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              SUBJECTIVE SOMATIC HIGH
            </Text>
            <View
              style={{
                backgroundColor: somatic.color + "22",
                paddingHorizontal: 8,
                paddingVertical: 3.5,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: somatic.color + "44",
              }}
            >
              <Text
                style={{
                  color: somatic.color,
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: 0.8,
                }}
              >
                {somatic.label}
              </Text>
            </View>
          </View>

          {/* Tactile Orb Score Display */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: Colors.softChalk,
                borderWidth: 2,
                borderColor: somatic.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 46,
                  fontWeight: "800",
                  letterSpacing: -1,
                }}
              >
                {energyScore}
              </Text>
              <Text
                style={{
                  color: Colors.espressoMuted,
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                INDEX / 100
              </Text>
            </View>

            <Text
              style={{
                color: Colors.espressoMuted,
                fontSize: 12.5,
                textAlign: "center",
                marginTop: 12,
                lineHeight: 18,
                paddingHorizontal: 16,
              }}
            >
              {somatic.desc}
            </Text>
          </View>

          {/* Tactical Fine-Tuning Step Controls */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              marginVertical: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => handleAdjustScore(-5)}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 10,
                paddingVertical: 9,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: Colors.sandDark,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>-5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAdjustScore(-1)}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 10,
                paddingVertical: 9,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: Colors.sandDark,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>-1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAdjustScore(+1)}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 10,
                paddingVertical: 9,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: Colors.sandDark,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>+1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAdjustScore(+5)}
              style={{
                backgroundColor: Colors.softChalk,
                borderRadius: 10,
                paddingVertical: 9,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: Colors.sandDark,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>+5</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Flow Presets */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
            {[
              { score: 55, label: "55 Grounded" },
              { score: 72, label: "72 Flow" },
              { score: 88, label: "88 Euphoria" },
              { score: 98, label: "98 Peak" },
            ].map((p) => (
              <TouchableOpacity
                key={p.score}
                onPress={() => handlePresetSelect(p.score)}
                style={{
                  flex: 1,
                  backgroundColor: energyScore === p.score ? Colors.olive : Colors.softChalk,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: energyScore === p.score ? Colors.olive : Colors.sandDark,
                }}
              >
                <Text
                  style={{
                    color: energyScore === p.score ? Colors.chalk : Colors.espresso,
                    fontSize: 10.5,
                    fontWeight: "700",
                  }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Somatic Observation Notes */}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Sensory observations (e.g. Crisp clay tempo, buoyant stride, effortless breath)"
            placeholderTextColor={Colors.espressoFaint}
            style={{
              backgroundColor: Colors.softChalk,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: Colors.espresso,
              fontSize: 13,
              fontWeight: "500",
              borderWidth: 1,
              borderColor: Colors.sandDark,
              marginBottom: 16,
            }}
          />

          {/* Lock In Energy High CTA */}
          <TouchableOpacity
            onPress={handleSaveEnergyLog}
            disabled={isPending}
            activeOpacity={0.88}
            style={{
              backgroundColor: Colors.olive,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.chalk,
                fontSize: 14.5,
                fontWeight: "800",
                letterSpacing: 0.8,
              }}
            >
              {isPending ? "Registering Somatic Pulse..." : "Lock In Somatic Endorphin High →"}
            </Text>
          </TouchableOpacity>
        </View>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}
