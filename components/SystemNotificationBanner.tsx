import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";

export function SystemNotificationBanner() {
  const router = useRouter();
  const { tap, confirm } = useHaptics();
  const { pendingNotification, bookings, openEnergyLoggingForBooking, clearNotification } =
    useBookingStore();

  if (!pendingNotification) return null;

  const targetBooking = bookings.find((b) => b.id === pendingNotification.booking_id);

  const handleBannerPress = () => {
    confirm();
    if (targetBooking) {
      openEnergyLoggingForBooking(targetBooking);
    }
    router.push("/(tabs)/energy");
  };

  const handleDismiss = (e: any) => {
    e.stopPropagation?.();
    tap();
    clearNotification();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -40 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -30 }}
      transition={{ type: "spring", damping: 18 }}
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 16 : 52,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 10,
      }}
    >
      <TouchableOpacity
        onPress={handleBannerPress}
        activeOpacity={0.92}
        style={{
          backgroundColor: "#161622",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: Colors.glow,
          shadowColor: Colors.glow,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
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
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Colors.glow,
              }}
            />
            <Text
              style={{
                color: Colors.glow,
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              POST-SESSION NOTIFICATION · 30M LATER
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: Colors.elevated,
            }}
          >
            <Text style={{ color: Colors.secondary, fontSize: 11 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: Colors.primary,
            fontSize: 15,
            fontWeight: "700",
            marginBottom: 4,
          }}
        >
          {pendingNotification.facility_name}
        </Text>

        <Text
          style={{
            color: Colors.secondary,
            fontSize: 13,
            lineHeight: 18,
            marginBottom: 10,
          }}
        >
          {pendingNotification.message}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.glow,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            Tap to open Energy Bar →
          </Text>
          <Text style={{ color: Colors.tertiary, fontSize: 10 }}>
            {pendingNotification.timestamp}
          </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}
