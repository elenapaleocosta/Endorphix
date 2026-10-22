import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";

interface StatTileProps {
  label: string;
  value: string | number;
  accent?: string;
}

function StatTile({ label, value, accent = Colors.glow }: StatTileProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 4,
      }}
    >
      <Text
        style={{ color: accent, fontSize: 28, fontWeight: "800" }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: Colors.tertiary,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.5,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ActivityHistorySection() {
  const { bookings } = useBookingStore();
  const loggedSessions = bookings.filter((b) => b.status === "energy_logged");

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay: 150 }}
      style={{ paddingHorizontal: Spacing.lg, marginBottom: 24 }}
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
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
          }}
        >
          ACTIVITY & ENERGY HISTORY
        </Text>
        <Text style={{ color: Colors.glow, fontSize: 11, fontWeight: "700" }}>
          {loggedSessions.length} LOGGED
        </Text>
      </View>

      {loggedSessions.length === 0 ? (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.secondary, fontSize: 13 }}>
            No completed sessions yet.
          </Text>
          <Text style={{ color: Colors.tertiary, fontSize: 11, marginTop: 4 }}>
            Reserve a court or facility to begin tracking somatic energy.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {loggedSessions.map((s) => (
            <View
              key={s.id}
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: "700" }}>
                    {s.activity_name}
                  </Text>
                  <Text style={{ color: Colors.tertiary, fontSize: 12 }}>
                    • {s.start_time}-{s.end_time}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: Colors.glow + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: Colors.glow, fontSize: 13, fontWeight: "800" }}>
                    {s.logged_energy_score}/100
                  </Text>
                </View>
              </View>

              <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                {s.facility_name} ({s.court_or_slot})
              </Text>
              <Text style={{ color: Colors.tertiary, fontSize: 10, marginTop: 4 }}>
                Somatic Energy Score: {s.logged_energy_score} · Stored in Vitality Passport
              </Text>
            </View>
          ))}
        </View>
      )}
    </MotiView>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { tap, confirm } = useHaptics();
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    confirm();
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            // Ignore guest signout network error
          }
          signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const currentUser = user || {
    id: "guest-athlete",
    email: "athlete@endorphix.luxury",
    username: "EndorphixAthlete",
    display_name: "Alex Vance",
    bio: "Endurance cyclist & vitality seeker.",
    avatar_url: "",
    streak_current: 7,
    streak_longest: 21,
    lifetime_sessions: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ paddingHorizontal: Spacing.lg, paddingTop: 64, marginBottom: 32 }}
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
          VITALITY PASSPORT
        </Text>

        {/* Avatar Placeholder / Photo */}
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            backgroundColor: Colors.elevated,
            borderWidth: 2,
            borderColor: Colors.glow,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          {currentUser.avatar_url ? (
            <Image
              source={{ uri: currentUser.avatar_url }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text style={{ color: Colors.glow, fontSize: 30, fontWeight: "800" }}>
              {(currentUser.display_name || currentUser.username || "E")[0].toUpperCase()}
            </Text>
          )}
        </View>

        <Text
          style={{ color: Colors.primary, fontSize: 26, fontWeight: "800" }}
        >
          {currentUser.display_name || currentUser.username}
        </Text>
        <Text style={{ color: Colors.glow, fontSize: 13, fontWeight: "600", marginTop: 2 }}>
          @{currentUser.username}
        </Text>
        <Text style={{ color: Colors.secondary, fontSize: 13, marginTop: 4 }}>
          {currentUser.email}
        </Text>
        {currentUser.bio ? (
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              fontStyle: "italic",
            }}
          >
            "{currentUser.bio}"
          </Text>
        ) : null}
      </MotiView>

      {/* Lifetime Stats */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 100 }}
        style={{ paddingHorizontal: Spacing.lg, marginBottom: 24 }}
      >
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          LIFETIME MOMENTUM
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile
            label="SESSIONS"
            value={currentUser.lifetime_sessions}
            accent={Colors.glow}
          />
          <StatTile
            label="STREAK"
            value={`${currentUser.streak_current}d`}
            accent={Colors.spark}
          />
          <StatTile
            label="BEST"
            value={`${currentUser.streak_longest}d`}
            accent={Colors.pulse}
          />
        </View>
      </MotiView>

      {/* Activity History Feed */}
      <ActivityHistorySection />

      {/* Account Controls */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500, delay: 200 }}
        style={{ paddingHorizontal: Spacing.lg }}
      >
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          ACCOUNT
        </Text>

        {[
          {
            label: "Edit Profile",
            onPress: () => {
              tap();
              router.push("/profile/edit");
            },
          },
          {
            label: "Notification Preferences",
            onPress: () => {
              tap();
              router.push("/profile/notifications");
            },
          },
          {
            label: "Privacy & Data",
            onPress: () => {
              tap();
              router.push("/profile/privacy");
            },
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: Colors.primary, fontSize: 15 }}>
              {item.label}
            </Text>
            <Text style={{ color: Colors.tertiary, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            borderWidth: 1,
            borderColor: Colors.danger,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.danger,
              fontSize: 14,
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            SIGN OUT
          </Text>
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
    </View>
  );
}
