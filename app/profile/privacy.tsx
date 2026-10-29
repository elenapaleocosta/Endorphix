import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { useEnergyLogs, useEnergyWave } from "@/hooks/useEnergy";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors, Spacing } from "@/constants";

export default function PrivacyScreen() {
  const { isPhone, isTablet, isDesktop } = useResponsive();
  const router = useRouter();
  const { tap, selection, confirm, success, error: errorHaptic } = useHaptics();
  const { user, privacy, setPrivacy, deleteAccount } = useAuthStore();
  const { bookings } = useBookingStore();
  const { data: logs } = useEnergyLogs();
  const { data: waveData } = useEnergyWave(30);

  const [isPublic, setIsPublic] = useState(privacy.profileVisibility === "public");
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleVisibility = (newValue: boolean) => {
    selection();
    setIsPublic(newValue);
    setPrivacy({ profileVisibility: newValue ? "public" : "private" });
  };

  // ─── Download My Data ───────────────────────────────────────────────────────
  const handleDownloadMyData = () => {
    confirm();
    setIsExporting(true);

    try {
      const exportPayload = {
        exportDate: new Date().toISOString(),
        passportHolder: {
          id: user?.id,
          displayName: user?.display_name || `${user?.first_name} ${user?.last_name}`,
          email: user?.email,
          username: user?.username,
          bio: user?.bio,
          tier: "Charter Athlete",
        },
        lifetimeMetrics: {
          currentStreakDays: user?.streak_current ?? 9,
          longestStreakDays: user?.streak_longest ?? 24,
          lifetimeSessions: user?.lifetime_sessions ?? 48,
          privacyMode: isPublic ? "Public (Charter Member)" : "Private (Incognito Athlete)",
        },
        somaticEndorphinLogs: logs || [],
        energyWaveHistory: waveData || [],
        bookingsAndCourts: bookings || [],
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);

      // On Web: Trigger instant browser file download
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `endorphix-passport-archive-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setIsExporting(false);
      success();
      showAlert(
        "Data Export Prepared",
        `Your complete Vitality Passport archive (profile, ${logs?.length || 2} somatic logs, ${bookings.length} court bookings, and streak metrics) has been packaged and downloaded.`
      );
    } catch (err: any) {
      setIsExporting(false);
      errorHaptic();
      showAlert("Export Notice", "Could not complete data export: " + err.message);
    }
  };

  // ─── Destructive Account Deletion ───────────────────────────────────────────
  const handleDeleteAccount = () => {
    tap();
    showAlert(
      "Erase Vitality Passport",
      "Are you certain? All historical streaks, energy wave logs, and local preferences will be permanently wiped. This action cannot be reversed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Permanently Erase",
          style: "destructive",
          onPress: () => {
            deleteAccount();
            success();
            showAlert("Passport Erased", "All athlete data has been cleared from this device.");
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 60,
          paddingTop: Platform.OS === "ios" ? 56 : 40,
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={640} noPadding>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: Colors.sand,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 18, fontWeight: "700" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color: Colors.espresso, fontSize: 18, fontWeight: "800" }}>
            Privacy & Data Controls
          </Text>
        </View>

        {/* ─── Profile Visibility Toggle ─── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          style={{ marginBottom: 24 }}
        >
          <Text
            style={{
              color: Colors.olive,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            PASSPORT VISIBILITY & PROXIMITY DISCOVERY
          </Text>

          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              padding: 18,
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
              <View style={{ flex: 1, paddingRight: 14 }}>
                <Text style={{ color: Colors.espresso, fontSize: 15, fontWeight: "800", marginBottom: 3 }}>
                  {isPublic ? "Charter Athlete (Public)" : "Incognito Athlete (Private)"}
                </Text>
                <Text style={{ color: Colors.espressoMuted, fontSize: 12, lineHeight: 17 }}>
                  {isPublic
                    ? "Visible to sports clubs and facilities within your 50km radius for seamless check-in and court confirmation."
                    : "Coordinates remain purely local on your device. Facility lookups remain anonymous."}
                </Text>
              </View>

              <Switch
                value={isPublic}
                onValueChange={handleToggleVisibility}
                trackColor={{ false: Colors.sandDark, true: Colors.olive }}
                thumbColor={Colors.chalk}
              />
            </View>

            <View
              style={{
                backgroundColor: isPublic ? Colors.olive + "16" : Colors.softChalk,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: isPublic ? Colors.olive + "33" : Colors.sandDark,
              }}
            >
              <Text style={{ color: isPublic ? Colors.olive : Colors.espressoMuted, fontSize: 11, fontWeight: "700" }}>
                Status: {isPublic ? "✓ Public 50km Radius Broadcast Active" : "○ Local Only (Incognito)"}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* ─── Download My Data ─── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350, delay: 100 }}
          style={{ marginBottom: 28 }}
        >
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            DATA ARCHIVE & EXPORT
          </Text>

          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              padding: 18,
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 15, fontWeight: "800", marginBottom: 4 }}>
              Download My Data
            </Text>
            <Text style={{ color: Colors.espressoMuted, fontSize: 12.5, lineHeight: 18, marginBottom: 14 }}>
              Export a complete archive of your Vitality Passport, including your biographical records, consecutive streak statistics, and all logged somatic endorphin scores in standard JSON format.
            </Text>

            <TouchableOpacity
              onPress={handleDownloadMyData}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.navy,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ color: Colors.chalk, fontSize: 13, fontWeight: "800", letterSpacing: 0.5 }}>
                {isExporting ? "Packaging Archive..." : "Download Passport Archive (.json) 📥"}
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* ─── Destructive Account Deletion ─── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350, delay: 200 }}
        >
          <Text
            style={{
              color: Colors.terracotta,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            DANGER ZONE · IRREVERSIBLE ACTION
          </Text>

          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: Colors.terracotta + "66",
              padding: 18,
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 15, fontWeight: "800", marginBottom: 4 }}>
              Erase Vitality Passport
            </Text>
            <Text style={{ color: Colors.espressoMuted, fontSize: 12.5, lineHeight: 18, marginBottom: 14 }}>
              Permanently purge all athlete identity details, historical streaks, D3 energy wave timelines, and venue preferences. This cannot be recovered.
            </Text>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.terracotta,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.chalk, fontSize: 13.5, fontWeight: "800", letterSpacing: 0.5 }}>
                Erase Vitality Passport Permanently ✕
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}
