import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { supabase } from "@/lib/supabase";
import { Colors, Spacing } from "@/constants";

export default function PrivacyDataScreen() {
  const router = useRouter();
  const { tap, confirm, selection, heavy } = useHaptics();
  const { user, privacy, setPrivacy, deleteAccount } = useAuthStore();
  const { bookings } = useBookingStore();

  const [isExporting, setIsExporting] = useState(false);
  const isPublic = privacy.profileVisibility === "public";

  const handleToggleVisibility = (val: boolean) => {
    selection();
    setPrivacy({ profileVisibility: val ? "public" : "private" });
  };

  const handleDownloadData = () => {
    confirm();
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const dataPayload = {
        athlete: user,
        privacy,
        session_history: bookings,
        export_date: new Date().toISOString(),
      };
      showAlert(
        "Data Export Prepared",
        `Your Vitality archive containing ${bookings.length} activity reservations and profile telemetry has been packaged securely. A download summary has been logged to your console.`,
        [{ text: "Done" }]
      );
      console.log("Athlete Data Export Payload:", JSON.stringify(dataPayload, null, 2));
    }, 1200);
  };

  const handleDeleteAccount = () => {
    heavy();
    showAlert(
      "Delete Account?",
      "This action is permanent and cannot be undone. All your Vitality Passport logs, reservations, and lifetime momentum records will be erased forever.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (e) {
              // ignore guest signout error
            }
            deleteAccount();
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      {/* Top Bar */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : 44,
          paddingHorizontal: Spacing.lg,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: Colors.void,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            tap();
            router.back();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={{ color: Colors.glow, fontSize: 15, fontWeight: "600" }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}>
          Privacy & Data
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: 28, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Visibility */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ marginBottom: 28 }}
        >
          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            VISIBILITY CONTROLS
          </Text>

          <View
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 15,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                {isPublic ? "Public Vitality Profile" : "Private Athlete Mode"}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 12, lineHeight: 17 }}>
                {isPublic
                  ? "Your athletic streak and energy momentum are discoverable by fellow club members."
                  : "Your vitality telemetry is private. Only you can view your energy scores and streaks."}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={handleToggleVisibility}
              trackColor={{ false: Colors.elevated, true: Colors.glow }}
              thumbColor={Platform.OS === "ios" ? "#FFFFFF" : isPublic ? "#FFFFFF" : Colors.tertiary}
              ios_backgroundColor={Colors.elevated}
            />
          </View>
        </MotiView>

        {/* Data Management */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450, delay: 100 }}
          style={{ marginBottom: 36 }}
        >
          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            DATA ARCHIVE
          </Text>

          <TouchableOpacity
            onPress={handleDownloadData}
            disabled={isExporting}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: "700", marginBottom: 4 }}>
                Download My Data
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 12, lineHeight: 17 }}>
                Export a machine-readable JSON copy of your bookings, activity history, and somatic vitality ratings.
              </Text>
            </View>
            {isExporting ? (
              <ActivityIndicator color={Colors.glow} size="small" />
            ) : (
              <Text style={{ color: Colors.glow, fontSize: 13, fontWeight: "700" }}>Export</Text>
            )}
          </TouchableOpacity>
        </MotiView>

        {/* Danger Zone: Account Deletion */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450, delay: 200 }}
        >
          <Text
            style={{
              color: Colors.danger,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            DESTRUCTIVE ACTIONS
          </Text>

          <View
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.3)",
              borderRadius: 14,
              padding: 16,
              gap: 14,
            }}
          >
            <Text style={{ color: Colors.secondary, fontSize: 12, lineHeight: 18 }}>
              Deleting your account permanently strips your credentials and severs all associated reservation passes and somatic logs from the Endorphix network.
            </Text>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                borderWidth: 1,
                borderColor: Colors.danger,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.danger,
                  fontSize: 13,
                  fontWeight: "800",
                  letterSpacing: 1.5,
                }}
              >
                DELETE ACCOUNT PERMANENTLY
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
