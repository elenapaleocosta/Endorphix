import React from "react";
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
import { Colors, Spacing } from "@/constants";

interface ToggleRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function ToggleRow({ title, subtitle, value, onValueChange }: ToggleRowProps) {
  return (
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
        marginBottom: 12,
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
          {title}
        </Text>
        <Text style={{ color: Colors.secondary, fontSize: 12, lineHeight: 17 }}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.elevated, true: Colors.glow }}
        thumbColor={Platform.OS === "ios" ? "#FFFFFF" : value ? "#FFFFFF" : Colors.tertiary}
        ios_backgroundColor={Colors.elevated}
      />
    </View>
  );
}

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { tap, selection } = useHaptics();
  const { notifications, setNotifications } = useAuthStore();

  const handleToggle = (key: keyof typeof notifications, val: boolean) => {
    selection();
    setNotifications({ [key]: val });
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
          Notifications
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: 28, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ marginBottom: 24 }}
        >
          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              marginBottom: 6,
            }}
          >
            DISPATCH PREFERENCES
          </Text>
          <Text style={{ color: Colors.secondary, fontSize: 13, lineHeight: 19 }}>
            Customize how and when Endorphix alerts you regarding reservations, post-activity energy
            surveys, and vitality logs.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450, delay: 100 }}
        >
          {/* Push Notifications */}
          <ToggleRow
            title="Push Notifications"
            subtitle="Real-time alerts for booking confirmations and instant venue directions."
            value={notifications.pushNotifications}
            onValueChange={(val) => handleToggle("pushNotifications", val)}
          />

          {/* Activity Alerts */}
          <ToggleRow
            title="Activity & Energy Alerts"
            subtitle="Gentle 30-minute post-activity prompts to record somatic energy scores into your passport."
            value={notifications.activityAlerts}
            onValueChange={(val) => handleToggle("activityAlerts", val)}
          />

          {/* Email Updates */}
          <ToggleRow
            title="Email Updates"
            subtitle="Weekly digest of your 30-day somatic energy wave and momentum metrics."
            value={notifications.emailUpdates}
            onValueChange={(val) => handleToggle("emailUpdates", val)}
          />

          {/* Marketing Messages */}
          <ToggleRow
            title="Marketing & Spotlights"
            subtitle="Curated athletic clubs, exclusive court releases, and luxury partner events."
            value={notifications.marketingMessages}
            onValueChange={(val) => handleToggle("marketingMessages", val)}
          />
        </MotiView>
      </ScrollView>
    </View>
  );
}
