import { Stack } from "expo-router";
import { Colors } from "@/constants";

export default function AuthLayout() {
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
