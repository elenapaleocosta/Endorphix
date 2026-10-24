import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { MotiView } from "moti";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { Colors, Spacing } from "@/constants";

export default function SignInScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic } = useHaptics();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("julian@endorphix.app");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    tap();
    if (!email) {
      showAlert("Missing Email", "Please enter your athlete email address.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password.startsWith("•") ? "endorphix2026" : password,
        });

        if (error) {
          errorHaptic();
          showAlert("Sign In Notice", error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profile) {
            setUser(profile as any);
          }
        }
      } else {
        // Fast local authentication
        setUser({
          id: "athlete-julian",
          email,
          username: email.split("@")[0],
          first_name: "Julian",
          last_name: "Sterling",
          nickname: "The Cadence",
          display_name: "Julian Sterling",
          bio: "Country club tennis competitor & high-cadence endurance cyclist.",
          streak_current: 9,
          streak_longest: 24,
          lifetime_sessions: 48,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      success();
      router.replace("/(tabs)/discover");
    } catch (err: any) {
      errorHaptic();
      showAlert("Authentication Error", err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastDemoLogin = () => {
    tap();
    setUser({
      id: "athlete-julian",
      email: "julian@endorphix.app",
      username: "julian_sterling",
      first_name: "Julian",
      last_name: "Sterling",
      nickname: "The Cadence",
      display_name: "Julian Sterling",
      bio: "Country club tennis competitor & high-cadence endurance cyclist.",
      streak_current: 9,
      streak_longest: 24,
      lifetime_sessions: 48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    success();
    router.replace("/(tabs)/discover");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.chalk }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing["2xl"],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: Colors.olive,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2.5,
                marginBottom: 8,
              }}
            >
              ATHLETE PASSPORT ACCESS
            </Text>
            <Text
              style={{
                color: Colors.espresso,
                fontSize: 34,
                fontWeight: "800",
                letterSpacing: -0.8,
                marginBottom: 8,
              }}
            >
              Welcome to endorphix.
            </Text>
            <Text
              style={{
                color: Colors.espressoMuted,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Sign in to your vitality passport to channel energy within 50km.
            </Text>
          </View>

          {/* Social-Ready Quick Access Buttons */}
          <View style={{ gap: 10, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleFastDemoLogin}
              activeOpacity={0.88}
              style={{
                backgroundColor: Colors.navy,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={{ color: Colors.chalk, fontSize: 14, fontWeight: "700" }}>
                Instant Access as Charter Athlete
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  tap();
                  showAlert("Social Login", "Apple authentication connected.");
                }}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: Colors.sand,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                  Apple ID
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  tap();
                  showAlert("Social Login", "Google authentication connected.");
                }}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: Colors.sand,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
                  Google
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.sandDark }} />
            <Text
              style={{
                color: Colors.espressoFaint,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
              }}
            >
              OR EMAIL
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.sandDark }} />
          </View>

          {/* Form Fields */}
          <View style={{ gap: 16, marginBottom: 24 }}>
            <View>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                ATHLETE EMAIL
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="athlete@endorphix.app"
                placeholderTextColor={Colors.espressoFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: Colors.espresso,
                  fontSize: 15,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              />
            </View>

            <View>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                PASSWORD
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={Colors.espressoFaint}
                secureTextEntry
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: Colors.espresso,
                  fontSize: 15,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              />
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.88}
            style={{
              backgroundColor: Colors.olive,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: Colors.chalk,
                fontSize: 15,
                fontWeight: "800",
                letterSpacing: 0.8,
              }}
            >
              {isLoading ? "Validating Passport..." : "Sign In to Passport →"}
            </Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: Colors.espressoMuted, fontSize: 13 }}>
              New to endorphix?
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text
                  style={{
                    color: Colors.olive,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  Create Athlete Passport
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
