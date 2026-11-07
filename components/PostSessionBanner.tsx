import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import { EASE_OUT } from "@/lib/motion";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { Button, IconButton } from "@/components/ui";

/** In-app alert shown 30 minutes after a session ends, prompting an Endorphin Bar entry. */
export function PostSessionBanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === s.alertBookingId));
  const dismissAlert = useBookingStore((s) => s.dismissAlert);
  const signedIn = useAuthStore((s) => s.user !== null);

  // AnimatePresence keeps the banner mounted long enough to leave the way it came: back up through the top.
  return (
    <AnimatePresence>
      {booking && signedIn ? (
        <MotiView
          key={booking.id}
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -16 }}
          transition={{ type: "timing", duration: 220, easing: EASE_OUT }}
          exitTransition={{ type: "timing", duration: 160, easing: EASE_OUT }}
          style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, zIndex: 50, alignItems: "center" }}
        >
          <View accessibilityRole="alert" className="w-full max-w-xl gap-3 rounded-2xl bg-fg p-4">
            <View className="flex-row items-start gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-2xs font-display-bold uppercase tracking-eyebrow text-surface">30 min post-session</Text>
                <Text numberOfLines={1} className="mt-1 text-base font-bold text-canvas">
                  {booking.facility_name}
                </Text>
                <Text className="mt-0.5 text-sm text-surface">
                  Your {booking.start_time}–{booking.end_time} {booking.activity_name.toLowerCase()} session is done. How
                  high is your endorphin level?
                </Text>
              </View>
              <IconButton icon="close" accessibilityLabel="Dismiss check-in" onPress={dismissAlert} />
            </View>
            <Button
              label="Log my energy"
              size="sm"
              onPress={() => {
                dismissAlert();
                router.push({ pathname: "/energy/modal", params: { bookingId: booking.id } });
              }}
            />
          </View>
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
}
