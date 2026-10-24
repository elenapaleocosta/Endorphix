import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useBookingStore } from "@/store/booking.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors } from "@/constants";

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
    router.push("/energy/modal");
  };

  const handleDismiss = (e: any) => {
    e.stopPropagation?.();
    tap();
    clearNotification();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ type: "timing", duration: 220 }}
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 16 : 52,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        onPress={handleBannerPress}
        activeOpacity={0.92}
        style={{
          backgroundColor: Colors.charcoal,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.terracotta,
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
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: Colors.terracotta,
              }}
            />
            <Text
              style={{
                color: Colors.terracottaLight,
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              IN-PHONE ALERT · 30M POST-ACTIVITY
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: Colors.espressoMuted + "44",
            }}
          >
            <Text style={{ color: Colors.sand, fontSize: 11, fontWeight: "700" }}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: Colors.chalk,
            fontSize: 15,
            fontWeight: "800",
            marginBottom: 4,
          }}
        >
          {pendingNotification.facility_name}
        </Text>

        <Text
          style={{
            color: Colors.sandLight,
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
            borderTopWidth: 1,
            borderTopColor: Colors.espressoMuted + "33",
            paddingTop: 8,
          }}
        >
          <Text
            style={{
              color: Colors.oliveLight,
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 0.5,
            }}
          >
            Tap to slide After-Activity Energy Bar →
          </Text>
          <Text style={{ color: Colors.sandDark, fontSize: 10 }}>
            {pendingNotification.timestamp}
          </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}
