import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";
import { Colors } from "@/constants";
import { useHaptics } from "@/hooks/useHaptics";
import { useLocation } from "@/hooks/useLocation";

// ─── Custom Tab Icon ──────────────────────────────────────────────────────────

function TabIcon({
  label,
  symbol,
  focused,
  activeColor = Colors.olive,
}: {
  label: string;
  symbol: string;
  focused: boolean;
  activeColor?: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingTop: 6,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: focused ? activeColor : Colors.espressoMuted,
          opacity: focused ? 1 : 0.65,
        }}
      >
        {symbol}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 1.5,
          color: focused ? activeColor : Colors.espressoMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Tabs Layout (Streamlined: Discover · Spark · Passport) ───────────────────

export default function TabsLayout() {
  const { tap } = useHaptics();

  // Watch location coordinates at root tab level
  useLocation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.chalk,
          borderTopColor: Colors.sandDark,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
        },
        tabBarActiveTintColor: Colors.olive,
        tabBarInactiveTintColor: Colors.espressoMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="DISCOVER"
              symbol="◎"
              focused={focused}
              activeColor={Colors.olive}
            />
          ),
          tabBarAccessibilityLabel: "Discover Facilities",
        }}
        listeners={{ tabPress: () => tap() }}
      />

      <Tabs.Screen
        name="spark"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="SPARK"
              symbol="⚡"
              focused={focused}
              activeColor={Colors.terracotta}
            />
          ),
          tabBarAccessibilityLabel: "Spark Surprise Me",
        }}
        listeners={{ tabPress: () => tap() }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="PASSPORT"
              symbol="◉"
              focused={focused}
              activeColor={Colors.navy}
            />
          ),
          tabBarAccessibilityLabel: "Vitality Passport Profile",
        }}
        listeners={{ tabPress: () => tap() }}
      />
    </Tabs>
  );
}
