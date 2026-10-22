import { Tabs } from "expo-router";
import { View, Text, Platform, Dimensions } from "react-native";
import { Colors } from "@/constants";
import { useHaptics } from "@/hooks/useHaptics";
import { useLocation } from "@/hooks/useLocation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Tab Icon ──────────────────────────────────────────────────────────────────

function TabIcon({
  label,
  symbol,
  focused,
}: {
  label: string;
  symbol: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 3, paddingTop: 4 }}>
      <Text
        style={{
          fontSize: 20,
          opacity: focused ? 1 : 0.4,
        }}
      >
        {symbol}
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 1.5,
          color: focused ? Colors.glow : Colors.tertiary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const { tap } = useHaptics();

  // Initialize location watching at the navigator level
  useLocation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                }),
              },
            ],
          },
        }),
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 280,
          },
        },
        tabBarStyle: {
          backgroundColor: Colors.void,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarActiveTintColor: Colors.glow,
        tabBarInactiveTintColor: Colors.tertiary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="DISCOVER" symbol="◎" focused={focused} />
          ),
          tabBarAccessibilityLabel: "Discover",
        }}
        listeners={{ tabPress: () => tap() }}
      />
      <Tabs.Screen
        name="energy"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="ENERGY" symbol="◈" focused={focused} />
          ),
          tabBarAccessibilityLabel: "Energy Log",
        }}
        listeners={{ tabPress: () => tap() }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="PROFILE" symbol="◉" focused={focused} />
          ),
          tabBarAccessibilityLabel: "Profile",
        }}
        listeners={{ tabPress: () => tap() }}
      />
    </Tabs>
  );
}
