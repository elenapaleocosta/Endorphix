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
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { Colors, Spacing } from "@/constants";

interface NotificationRowProps {
  title: string;
  subtitle: string;
  badge?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function NotificationRow({
  title,
  subtitle,
  badge,
  value,
  onValueChange,
}: NotificationRowProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.sand,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, paddingRight: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 14.5,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
          {badge && (
            <View
              style={{
                backgroundColor: Colors.olive + "22",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: Colors.olive, fontSize: 9.5, fontWeight: "800" }}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: Colors.espressoMuted, fontSize: 12, lineHeight: 17 }}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.sandDark, true: Colors.olive }}
        thumbColor={Colors.chalk}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { tap, selection, success } = useHaptics();
  const { notifications, setNotifications } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(notifications.pushNotifications);
  const [emailEnabled, setEmailEnabled] = useState(notifications.emailUpdates);
  const [activityAlertsEnabled, setActivityAlertsEnabled] = useState(notifications.activityAlerts);
  const [marketingEnabled, setMarketingEnabled] = useState(notifications.marketingMessages);

  const handleSavePreferences = () => {
    tap();
    setNotifications({
      pushNotifications: pushEnabled,
      emailUpdates: emailEnabled,
      activityAlerts: activityAlertsEnabled,
      marketingMessages: marketingEnabled,
    });
    success();
    showAlert("Cadence Saved", "Your notification preferences have been saved.");
    router.back();
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
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
            Notification Preferences
          </Text>

          <TouchableOpacity onPress={handleSavePreferences}>
            <Text style={{ color: Colors.olive, fontSize: 14, fontWeight: "800" }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Somatic & Real-Time Alerts */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
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
            ACTIVE SIGNALS & SOMATIC PROTOCOLS
          </Text>

          {/* Activity / Alerts */}
          <NotificationRow
            title="Activity & 30m Post-Session Alerts"
            badge="RECOMMENDED"
            subtitle="Triggers the in-phone somatic notification exactly 30 minutes after your workout concludes so you can slide your Endorphin High."
            value={activityAlertsEnabled}
            onValueChange={(val) => {
              selection();
              setActivityAlertsEnabled(val);
            }}
          />

          {/* Push Notifications */}
          <NotificationRow
            title="Push Notifications"
            subtitle="Real-time alerts when top-rated facilities enter live activity within your 50km radius or when new court slots open."
            value={pushEnabled}
            onValueChange={(val) => {
              selection();
              setPushEnabled(val);
            }}
          />
        </MotiView>

        {/* Section 2: Digests & Editorial */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350, delay: 100 }}
          style={{ marginTop: 12 }}
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
            COMMUNICATIONS & DIGESTS
          </Text>

          {/* Email Updates */}
          <NotificationRow
            title="Email Updates & Wave Digest"
            subtitle="Weekly editorial summary of your consecutive streaks, average endorphin index, and vitality momentum."
            value={emailEnabled}
            onValueChange={(val) => {
              selection();
              setEmailEnabled(val);
            }}
          />

          {/* Marketing Messages */}
          <NotificationRow
            title="Marketing Messages"
            subtitle="Occasional invitations to country club tournaments, athletic retreats, and exclusive charter releases."
            value={marketingEnabled}
            onValueChange={(val) => {
              selection();
              setMarketingEnabled(val);
            }}
          />
        </MotiView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSavePreferences}
          activeOpacity={0.88}
          style={{
            backgroundColor: Colors.olive,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: Colors.chalk, fontSize: 14.5, fontWeight: "800", letterSpacing: 0.5 }}>
            Save Notification Preferences →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
