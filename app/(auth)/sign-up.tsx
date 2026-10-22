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

export default function SignUpScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic } = useHaptics();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    tap();
    if (!email || !password || !username) {
      showAlert("Missing Fields", "Please provide a username, email, and password.");
      return;
    }

    setIsLoading(true);
    try {
      const isPlaceholderConfig =
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

      if (isPlaceholderConfig) {
        const mockUser = {
          id: "demo-user-" + Date.now(),
          email,
          username,
          streak_current: 1,
          streak_longest: 1,
          lifetime_sessions: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { useAuthStore } = await import("@/store/auth.store");
        useAuthStore.getState().setUser(mockUser);
        success();
        showAlert("Passport Activated", "Welcome to endorphix! Jumping straight into discovery.");
        router.replace("/(tabs)");
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        errorHaptic();
        showAlert("Registration failed", error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Insert user profile row
        await supabase.from("users").insert({
          id: data.user.id,
          email,
          username,
        });
      }

      success();
      showAlert(
        "Check your email",
        "We sent a verification link. Once confirmed, sign in to begin."
      );
      router.replace("/(auth)/sign-in");
    } catch (err: any) {
      errorHaptic();
      showAlert("Registration error", err.message || "An unexpected error occurred");
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
          flexGrow: 1,
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
            Create your{"\n"}passport.
          </Text>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 15,
              marginBottom: 48,
            }}
          >
            Your vitality journey starts here.
          </Text>

          {[
            {
              label: "USERNAME",
              value: username,
              setter: setUsername,
              placeholder: "athlete_handle",
              type: "default" as const,
            },
            {
              label: "EMAIL",
              value: email,
              setter: setEmail,
              placeholder: "you@example.com",
              type: "email-address" as const,
            },
          ].map(({ label, value, setter, placeholder, type }) => (
            <View key={label} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: Colors.secondary,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                {label}
              </Text>
              <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={Colors.tertiary}
                keyboardType={type}
                autoCapitalize="none"
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
          ))}

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
              placeholder="Min. 8 characters"
              placeholderTextColor={Colors.tertiary}
              secureTextEntry
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

          <TouchableOpacity
            onPress={handleSignUp}
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
              {isLoading ? "CREATING…" : "CREATE ACCOUNT"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity onPress={tap}>
              <Text
                style={{
                  color: Colors.secondary,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Already have an account?{" "}
                <Text style={{ color: Colors.spark }}>Sign in →</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
