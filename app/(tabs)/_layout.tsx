import { type ComponentProps } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { Redirect, Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
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

export default function TabsLayout() {
  useDeviceLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-chalk">
        <ActivityIndicator color={Colors.olive} size="large" accessibilityLabel="Loading" />
      </View>
    );
  }
  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;

  const wide = width >= WIDE_BREAKPOINT;
  const capsuleWidth = Math.min(width - 32, 480);

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptics.selection() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.olive,
        tabBarInactiveTintColor: Colors.inkMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: wide
          ? {
              position: "absolute",
              bottom: 16 + insets.bottom,
              left: (width - capsuleWidth) / 2,
              width: capsuleWidth,
              height: TAB_BAR_HEIGHT,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Colors.line,
              backgroundColor: Colors.chalk,
            }
          : {
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingTop: 8,
              paddingBottom: insets.bottom + 8,
              borderTopColor: Colors.line,
              backgroundColor: Colors.chalk,
            },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: "Discover", tabBarIcon: tabIcon("compass", "compass-outline") }} />
      <Tabs.Screen name="spark" options={{ title: "Spark", tabBarIcon: tabIcon("flash", "flash-outline") }} />
      <Tabs.Screen
        name="profile"
        options={{ title: "Passport", tabBarIcon: tabIcon("person-circle", "person-circle-outline") }}
      />
    </Tabs>
  );
}
