import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import { useAuthStore, DEFAULT_AVATAR } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useEnergyWave } from "@/hooks/useEnergy";
import { useHaptics } from "@/hooks/useHaptics";
import { EnergyWaveChart } from "@/components/EnergyWaveChart";
import { showAlert } from "@/lib/alert";
import { Colors, Spacing } from "@/constants";

interface StatTileProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
}

function StatTile({
  label,
  value,
  sublabel,
  accent = Colors.olive,
}: StatTileProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.sand,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
      }}
    >
      <Text style={{ color: accent, fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text
        style={{
          color: Colors.espresso,
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 1.2,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
      {sublabel && (
        <Text style={{ color: Colors.espressoMuted, fontSize: 9.5, marginTop: 2 }}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { tap, confirm, selection, success, error: errorHaptic } = useHaptics();
  const { user, updateUserProfile, signOut } = useAuthStore();
  const { resetFTUE } = useOnboardingStore();
  const { bookings, openEnergyLoggingForBooking } = useBookingStore();
  const { data: waveData } = useEnergyWave(30);

  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const pendingRatings = bookings.filter((b) => b.status === "completed");
  const loggedSessions = bookings.filter((b) => b.status === "energy_logged");

  // ─── Native Media Library Photo Picker (Quick Avatar Update) ────────────────
  const handlePickAvatar = async () => {
    tap();
    try {
      setIsLoadingPhoto(true);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setIsLoadingPhoto(false);
        errorHaptic();
        showAlert(
          "Photo Access Required",
          "endorphix requires access to your photo library to update your Vitality Passport portrait. Please grant permission in your device settings."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        allowsMultipleSelection: false,
      });

      setIsLoadingPhoto(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        updateUserProfile({ avatar_url: selectedUri });
        selection();
        showAlert(
          "Avatar Updated",
          "Your Vitality Passport portrait has been successfully updated."
        );
      }
    } catch (err: any) {
      setIsLoadingPhoto(false);
      errorHaptic();
      showAlert("Photo Selection Notice", err.message || "Failed to select photo.");
    }
  };

  // ─── Active Sign Out Flow with Confirmation Dialog ──────────────────────────
  const handleSignOut = () => {
    confirm();
    showAlert(
      "Sign Out",
      "Are you sure you want to sign out of your Vitality Passport?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            signOut();
            success();
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  };

  const handleResetDemo = async () => {
    tap();
    await resetFTUE();
    showAlert("Onboarding Reset", "First-time experience reset. You will see onboarding on next launch.");
  };

  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.display_name || "Julian Sterling";

  const nickname = user?.nickname ? `"${user.nickname}"` : '"The Cadence"';
  const avatarUri = user?.avatar_url || DEFAULT_AVATAR;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 110,
          paddingTop: Platform.OS === "ios" ? 56 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
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
              marginBottom: 12,
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
              VITALITY PASSPORT
            </Text>
            <View
              style={{
                backgroundColor: Colors.terracotta + "18",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: Colors.terracotta + "44",
              }}
            >
              <Text
                style={{
                  color: Colors.terracotta,
                  fontSize: 9.5,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                50KM VERIFIED
              </Text>
            </View>
          </View>

          {/* Profile Card with Avatar & Camera Overlay Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              backgroundColor: Colors.sand,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              marginBottom: 6,
            }}
          >
            {/* Avatar with Camera Icon Overlay */}
            <TouchableOpacity
              onPress={handlePickAvatar}
              activeOpacity={0.85}
              style={{ position: "relative" }}
            >
              <Image
                source={{ uri: avatarUri }}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  borderWidth: 2.5,
                  borderColor: Colors.olive,
                  backgroundColor: Colors.sandDark,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: Colors.charcoal,
                  borderWidth: 2,
                  borderColor: Colors.chalk,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoadingPhoto ? (
                  <ActivityIndicator color={Colors.chalk} size="small" />
                ) : (
                  <Text style={{ fontSize: 12 }}>📷</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Athlete Credentials */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 22,
                  fontWeight: "800",
                  letterSpacing: -0.5,
                }}
              >
                {fullName}
              </Text>
              <Text
                style={{
                  color: Colors.camel,
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 1,
                }}
              >
                {nickname} · Charter Athlete
              </Text>
              <TouchableOpacity
                onPress={() => {
                  tap();
                  router.push("/profile/edit");
                }}
                style={{ marginTop: 6 }}
              >
                <Text style={{ color: Colors.olive, fontSize: 12, fontWeight: "800" }}>
                  Edit Profile ↗
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              paddingHorizontal: 4,
            }}
          >
            {user?.bio || "Country club tennis competitor & high-cadence endurance cyclist."}
          </Text>
        </MotiView>

        {/* ─── The D3 / SVG Energy Wave (Permanent Vitality Momentum Record) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 18 }}>
          <EnergyWaveChart
            data={waveData || []}
            activeStreak={user?.streak_current ?? 9}
          />
        </View>

        {/* ─── Discrete After-Activity Energy Check-In Section ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 20 }}>
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
                color: Colors.espressoMuted,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              AFTER-ACTIVITY ENERGY LOGS
            </Text>

            <TouchableOpacity
              onPress={() => {
                tap();
                router.push("/energy/modal");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ color: Colors.olive, fontSize: 11, fontWeight: "800" }}>
                + Spontaneous Pulse
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pending Post-Activity Sessions Awaiting Somatic Input */}
          {pendingRatings.length > 0 && (
            <View style={{ gap: 8, marginBottom: 12 }}>
              {pendingRatings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  onPress={() => {
                    confirm();
                    openEnergyLoggingForBooking(booking);
                    router.push(`/energy/modal?bookingId=${booking.id}`);
                  }}
                  activeOpacity={0.88}
                  style={{
                    backgroundColor: Colors.terracotta + "14",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1.5,
                    borderColor: Colors.terracotta,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.terracotta }} />
                      <Text style={{ color: Colors.terracotta, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>
                        COMPLETED 30M AGO · RATING PENDING
                      </Text>
                    </View>
                    <Text style={{ color: Colors.espresso, fontSize: 14, fontWeight: "800" }}>
                      {booking.facility_name}
                    </Text>
                    <Text style={{ color: Colors.espressoMuted, fontSize: 12 }}>
                      {booking.activity_name} ({booking.start_time}–{booking.end_time})
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: Colors.terracotta,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: Colors.chalk, fontSize: 11, fontWeight: "800" }}>
                      Slide Energy →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Logged Completed History */}
          {loggedSessions.length > 0 ? (
            <View style={{ gap: 8 }}>
              {loggedSessions.map((booking) => (
                <View
                  key={booking.id}
                  style={{
                    backgroundColor: Colors.sand,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                      {booking.facility_name}
                    </Text>
                    <Text style={{ color: Colors.espressoMuted, fontSize: 11 }}>
                      {booking.activity_name} · {booking.date}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: Colors.olive,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: Colors.chalk, fontSize: 12, fontWeight: "800" }}>
                      {booking.logged_energy_score || 92} / 100
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* ─── Lifetime Metric Tiles ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <StatTile
              label="CURRENT STREAK"
              value={`${user?.streak_current ?? 9}d`}
              sublabel="Active Cadence"
              accent={Colors.olive}
            />
            <StatTile
              label="LONGEST STREAK"
              value={`${user?.streak_longest ?? 24}d`}
              sublabel="Personal Best"
              accent={Colors.navy}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatTile
              label="TOTAL SESSIONS"
              value={user?.lifetime_sessions ?? 48}
              sublabel="Lifetime Moved"
              accent={Colors.camel}
            />
            <StatTile
              label="PEAK ENDORPHIN"
              value="98/100"
              sublabel="Flow State High"
              accent={Colors.terracotta}
            />
          </View>
        </View>

        {/* ─── Macro Realm Distribution (Water, Land, Mountain) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              padding: 18,
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
                  color: Colors.espresso,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                REALM VITALITY DISTRIBUTION
              </Text>
              <Text style={{ color: Colors.olive, fontSize: 11, fontWeight: "700" }}>
                ALL 50KM ZONES
              </Text>
            </View>

            {/* Tri-Color Stacked Bar */}
            <View
              style={{
                height: 10,
                borderRadius: 5,
                flexDirection: "row",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 65, backgroundColor: Colors.olive }} />
              <View style={{ flex: 20, backgroundColor: Colors.camel }} />
              <View style={{ flex: 15, backgroundColor: Colors.terracotta }} />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.olive }} />
                <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "700" }}>
                  Land (65%)
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.camel }} />
                <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "700" }}>
                  Water (20%)
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.terracotta }} />
                <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "700" }}>
                  Mountain (15%)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Passport Settings & Actions (Fully Connected Routing) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: 20 }}>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            PASSPORT SETTINGS
          </Text>

          <View
            style={{
              backgroundColor: Colors.sand,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              overflow: "hidden",
            }}
          >
            {[
              {
                title: "Edit Profile",
                subtitle: "Display Name, Username, Bio & Avatar upload",
                route: "/profile/edit",
                icon: "👤",
              },
              {
                title: "Notification Preferences",
                subtitle: "Push, Email, Activity Alerts & Marketing toggles",
                route: "/profile/notifications",
                icon: "🔔",
              },
              {
                title: "Privacy & Data",
                subtitle: "Download My Data, Visibility & Account Deletion",
                route: "/profile/privacy",
                icon: "🛡️",
              },
            ].map((item, idx) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => {
                  tap();
                  router.push(item.route as any);
                }}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: idx < 2 ? 1 : 0,
                  borderBottomColor: Colors.sandDark,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.espresso, fontSize: 14.5, fontWeight: "700" }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: Colors.espressoMuted, fontSize: 11.5, marginTop: 2 }}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: Colors.olive, fontSize: 16, fontWeight: "700" }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Action Controls (Active Sign Out Button with Confirmation Modal) ─── */}
        <View style={{ paddingHorizontal: Spacing.xl, gap: 10 }}>
          <TouchableOpacity
            onPress={handleResetDemo}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.sand,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
              Replay First-Time Experience (FTUE) ↺
            </Text>
          </TouchableOpacity>

          {/* Active Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.softChalk,
              borderWidth: 1.5,
              borderColor: Colors.terracotta + "66",
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Text style={{ color: Colors.terracotta, fontSize: 14, fontWeight: "800", letterSpacing: 0.5 }}>
              Sign Out of Vitality Passport ↗
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
