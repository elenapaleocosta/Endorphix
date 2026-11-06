import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Colors } from "@/constants";

export default function Index() {
  const authReady = useAuthStore((s) => s.hydrated);
  const onboardingReady = useOnboardingStore((s) => s.hydrated);
  const hasCompletedFTUE = useOnboardingStore((s) => s.hasCompletedFTUE);

  if (!authReady || !onboardingReady) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={Colors.accent} size="large" accessibilityLabel="Loading endorphix" />
      </View>
    );
  }

  if (!hasCompletedFTUE) return <Redirect href="/(onboarding)" />;
  // Signed in or not, Discover is the start: guests browse first and sign up when they book.
  return <Redirect href="/(tabs)/discover" />;
}
