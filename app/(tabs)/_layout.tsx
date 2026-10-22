import { Stack } from "expo-router";
import { Colors } from "@/constants";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.obsidian },
        animation: "none",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
