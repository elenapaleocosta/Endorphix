import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Colors } from "@/constants";

export default function Index() {
  const authReady = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);
  const onboardingReady = useOnboardingStore((s) => s.hydrated);
  const hasCompletedFTUE = useOnboardingStore((s) => s.hasCompletedFTUE);

  if (!authReady || !onboardingReady) {
    return (
      <View className="flex-1 items-center justify-center bg-chalk">
        <ActivityIndicator color={Colors.olive} size="large" accessibilityLabel="Loading endorphix" />
      </View>
    );
  }

  if (!hasCompletedFTUE) return <Redirect href="/(onboarding)" />;
  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)/discover" />;
}
