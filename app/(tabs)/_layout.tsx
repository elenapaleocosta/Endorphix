import { type ComponentProps } from "react";
import { ActivityIndicator, Easing, View, useWindowDimensions } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useReducedMotion } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";
import { useDeviceLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/auth.store";
import { TAB_BAR_HEIGHT, WIDE_BREAKPOINT } from "@/components/ui";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabIcon =
  (active: IconName, inactive: IconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

// Ionicons has no suitcase (only a briefcase, which reads as work), so Travel borrows a travel bag
// from Material Community Icons, drawn at the same size so it sits level with the other tabs.
const travelIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <MaterialCommunityIcons name={focused ? "bag-suitcase" : "bag-suitcase-outline"} size={22} color={color} />
);

/**
 * Tab change: a quiet fade through the canvas, never a slide (tabs are peers, not a hierarchy).
 * Progress runs 0 → ±1 for the outgoing tab and ±1 → 0 for the incoming one (the sign depends on
 * which side the tab sits), so the curve is symmetric: the outgoing tab clears in the first half,
 * the incoming one fades up in the second with a 4px settle. The two never double-expose.
 * Strong ease-out, kept short because tabs switch many times a session.
 */
const TAB_TRANSITION_SPEC: BottomTabNavigationOptions["transitionSpec"] = {
  animation: "timing",
  config: { duration: 220, easing: Easing.bezier(0.23, 1, 0.32, 1) },
};

const tabSceneStyle: BottomTabNavigationOptions["sceneStyleInterpolator"] = ({ current }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({ inputRange: [-1, -0.5, 0, 0.5, 1], outputRange: [0, 0, 1, 0, 0] }),
    transform: [
      { translateY: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [4, 0, 4] }) },
    ],
  },
});

export default function TabsLayout() {
  useDeviceLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={Colors.accent} size="large" accessibilityLabel="Loading" />
      </View>
    );
  }
  // Guests can browse Discover and Spark; an account is asked for when they reserve a slot.

  const wide = width >= WIDE_BREAKPOINT;
  const capsuleWidth = Math.min(width - 32, 480);

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptics.selection() }}
      screenOptions={{
        headerShown: false,
        // Reduced motion: switch instantly.
        ...(reduceMotion
          ? { animation: "none" as const }
          : { transitionSpec: TAB_TRANSITION_SPEC, sceneStyleInterpolator: tabSceneStyle }),
        sceneStyle: { backgroundColor: Colors.canvas },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.fgMuted,
        // An explicit line height so the label always gets a full line and is never clipped.
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: "700" },
        tabBarStyle: wide
          ? {
              position: "absolute",
              bottom: 16 + insets.bottom,
              left: (width - capsuleWidth) / 2,
              width: capsuleWidth,
              height: TAB_BAR_HEIGHT,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Colors.line,
              backgroundColor: Colors.canvas,
            }
          : {
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingTop: 6,
              paddingBottom: insets.bottom + 6,
              borderTopColor: Colors.line,
              backgroundColor: Colors.canvas,
            },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: "Discover", tabBarIcon: tabIcon("compass", "compass-outline") }} />
      <Tabs.Screen name="travel" options={{ title: "Travel", tabBarIcon: travelIcon }} />
      <Tabs.Screen name="spark" options={{ title: "Spark", tabBarIcon: tabIcon("flash", "flash-outline") }} />
      <Tabs.Screen
        name="profile"
        options={{ title: "Passport", tabBarIcon: tabIcon("person-circle", "person-circle-outline") }}
      />
    </Tabs>
  );
}
