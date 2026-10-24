import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/lib/query-client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { SystemNotificationBanner } from "@/components/SystemNotificationBanner";
import { Colors } from "@/constants";

export default function RootLayout() {
  const { setUser } = useAuthStore();
  const { checkFTUE } = useOnboardingStore();

  useEffect(() => {
    // Check onboarding state from AsyncStorage
    checkFTUE();

    // Listen to Supabase auth state if configured
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser(profile as any);
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor={Colors.chalk} />
        <SystemNotificationBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.chalk },
            animation: "none",
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="(onboarding)" options={{ gestureEnabled: false, animation: "none" }} />
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false, animation: "none" }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false, animation: "none" }} />
          <Stack.Screen
            name="energy/modal"
            options={{
              presentation: "modal",
              gestureEnabled: true,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="facility/[id]"
            options={{ gestureEnabled: false, animation: "none" }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{ gestureEnabled: false, animation: "none" }}
          />
          <Stack.Screen
            name="profile/notifications"
            options={{ gestureEnabled: false, animation: "none" }}
          />
          <Stack.Screen
            name="profile/privacy"
            options={{ gestureEnabled: false, animation: "none" }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
