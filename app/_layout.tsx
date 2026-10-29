import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/lib/query-client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { PostSessionBanner } from "@/components/PostSessionBanner";
import { Colors } from "@/constants";
import type { User } from "@/types";

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single();
      if (profile) setUser(profile as unknown as User);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.chalk } }}>
          <Stack.Screen name="index" options={{ animation: "none" }} />
          <Stack.Screen name="(onboarding)" options={{ animation: "fade" }} />
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade", gestureEnabled: false }} />
          <Stack.Screen name="energy/modal" options={{ presentation: "modal" }} />
        </Stack>
        <PostSessionBanner />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
