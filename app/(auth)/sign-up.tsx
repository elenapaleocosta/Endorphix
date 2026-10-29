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

export default function SignUpScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic } = useHaptics();
  const { setUser } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    tap();
    if (!firstName || !lastName || !email || !password) {
      showAlert(
        "Missing Information",
        "Please provide your Name, Surname, Email, and Password to issue your vitality passport."
      );
      return;
    }

    setIsLoading(true);
    try {
      const generatedUsername = (
        nickname || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
      )
        .replace(/\s+/g, "_")
        .slice(0, 24);

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          errorHaptic();
          showAlert("Registration Notice", error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          await supabase.from("users").insert({
            id: data.user.id,
            email,
            username: generatedUsername,
            first_name: firstName,
            last_name: lastName,
            nickname: nickname || null,
          });
        }
      }

      // Store in Auth Store
      const newAthlete = {
        id: "athlete-" + Date.now(),
        email,
        username: generatedUsername,
        first_name: firstName,
        last_name: lastName,
        nickname: nickname || `${firstName} "${nickname || 'Velocity'}" ${lastName}`,
        display_name: `${firstName} ${lastName}`,
        bio: `Athlete specializing in high-intensity endurance. Vitality passport activated.`,
        avatar_url: "",
        streak_current: 1,
        streak_longest: 1,
        lifetime_sessions: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(newAthlete);
      success();
      showAlert(
        "Vitality Passport Issued",
        `Welcome to endorphix, ${firstName}. Your passport is active within a 50km radius.`
      );
      router.replace("/(tabs)/discover");
    } catch (err: any) {
      errorHaptic();
      showAlert("Registration Error", err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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
        <View style={{ width: "100%", maxWidth: 460, alignSelf: "center" }}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          {/* Header */}
          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                color: Colors.olive,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2.5,
                marginBottom: 8,
              }}
            >
              NEW ATHLETE REGISTRATION
            </Text>
            <Text
              style={{
                color: Colors.espresso,
                fontSize: 32,
                fontWeight: "800",
                letterSpacing: -0.8,
                marginBottom: 8,
              }}
            >
              Issue your Vitality Passport.
            </Text>
            <Text
              style={{
                color: Colors.espressoMuted,
                fontSize: 14,
                lineHeight: 22,
              }}
            >
              Capture your athlete credentials to bridge intention into somatic action.
            </Text>
          </View>

          {/* Form Fields: Name, Surname, Nickname, Email, Password */}
          <View style={{ gap: 14, marginBottom: 24 }}>
            {/* First & Last Name row */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.espresso,
                    fontSize: 11.5,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  }}
                >
                  NAME (FIRST)
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="e.g. Julian"
                  placeholderTextColor={Colors.espressoFaint}
                  autoCapitalize="words"
                  style={{
                    backgroundColor: Colors.sand,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    color: Colors.espresso,
                    fontSize: 14.5,
                    fontWeight: "500",
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.espresso,
                    fontSize: 11.5,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  }}
                >
                  SURNAME
                </Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="e.g. Sterling"
                  placeholderTextColor={Colors.espressoFaint}
                  autoCapitalize="words"
                  style={{
                    backgroundColor: Colors.sand,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    color: Colors.espresso,
                    fontSize: 14.5,
                    fontWeight: "500",
                    borderWidth: 1,
                    borderColor: Colors.sandDark,
                  }}
                />
              </View>
            </View>

            {/* Nickname field */}
            <View>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 11.5,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                NICKNAME / CALLSIGN (OPTIONAL)
              </Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="e.g. The Cadence / Swift"
                placeholderTextColor={Colors.espressoFaint}
                autoCapitalize="words"
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  color: Colors.espresso,
                  fontSize: 14.5,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              />
            </View>

            {/* Email */}
            <View>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 11.5,
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
                placeholder="athlete@domain.com"
                placeholderTextColor={Colors.espressoFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  color: Colors.espresso,
                  fontSize: 14.5,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              />
            </View>

            {/* Password */}
            <View>
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 11.5,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                CONFIDENTIAL KEY (PASSWORD)
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor={Colors.espressoFaint}
                secureTextEntry
                style={{
                  backgroundColor: Colors.sand,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  color: Colors.espresso,
                  fontSize: 14.5,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              />
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            onPress={handleSignUp}
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
              {isLoading ? "Generating Passport..." : "Activate Vitality Passport →"}
            </Text>
          </TouchableOpacity>

          {/* Social-Ready Alternatives */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => showAlert("Social Access", "Apple ID registration ready.")}
              style={{
                backgroundColor: Colors.sand,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700" }}>
                Apple ID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showAlert("Social Access", "Google registration ready.")}
              style={{
                backgroundColor: Colors.sand,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: Colors.espresso, fontSize: 12, fontWeight: "700" }}>
                Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Back Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: Colors.espressoMuted, fontSize: 13 }}>
              Already hold an endorphix passport?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text
                  style={{
                    color: Colors.olive,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </MotiView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
