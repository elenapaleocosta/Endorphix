import { Stack } from "expo-router";
import { Colors } from "@/constants";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.chalk },
        animation: "none",
        gestureEnabled: false,
      }}
    />
  );
}
