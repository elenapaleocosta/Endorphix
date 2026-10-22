import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants";

export default function Index() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { hasCompletedFTUE, isLoading: onboardingLoading } = useOnboardingStore();

  if (authLoading || onboardingLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.obsidian,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={Colors.glow} />
      </View>
    );
  }

  if (!hasCompletedFTUE) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
