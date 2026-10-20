import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { MotiView } from "moti";
import { supabase } from "@/lib/supabase";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";

export default function SignInScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic } = useHaptics();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignIn = async () => {
    tap();
    if (!email || !password) {
      showAlert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // Allow demo bypass when default/placeholder Supabase URL is active
      const isPlaceholderConfig =
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

      if (isPlaceholderConfig) {
        // Mock user sign-in for local development/preview
        const mockUser = {
          id: "demo-user-" + Date.now(),
          email,
          username: email.split("@")[0] || "athlete",
          streak_current: 3,
          streak_longest: 7,
          lifetime_sessions: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { useAuthStore } = await import("@/store/auth.store");
        useAuthStore.getState().setUser(mockUser);
        success();
        router.replace("/(tabs)/discover");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        errorHaptic();
        showAlert("Sign in failed", error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();
        const { useAuthStore } = await import("@/store/auth.store");
        useAuthStore.getState().setUser(profile as any);
      }

      success();
      router.replace("/(tabs)/discover");
    } catch (err: any) {
      errorHaptic();
      showAlert("Sign in error", err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.obsidian }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: 100,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <Text
            style={{
              color: Colors.glow,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 3,
              marginBottom: 12,
            }}
          >
            ENDORPHIX
          </Text>
          <Text
            style={{
              color: Colors.primary,
              fontSize: 36,
              fontWeight: "800",
              lineHeight: 42,
              marginBottom: 8,
            }}
          >
            Welcome{"\n"}back.
          </Text>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 15,
              marginBottom: 48,
            }}
          >
            Sign in to resume your momentum.
          </Text>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: Colors.secondary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              EMAIL
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.primary,
                fontSize: 15,
              }}
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: Colors.secondary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              PASSWORD
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.tertiary}
              secureTextEntry
              autoComplete="password"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.primary,
                fontSize: 15,
              }}
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.glow,
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: "center",
              opacity: isLoading ? 0.6 : 1,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: Colors.obsidian,
                fontSize: 15,
                fontWeight: "700",
                letterSpacing: 1.5,
              }}
            >
              {isLoading ? "SIGNING IN…" : "SIGN IN"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity onPress={tap}>
              <Text
                style={{
                  color: Colors.secondary,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                No account?{" "}
                <Text style={{ color: Colors.spark }}>Create one →</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
