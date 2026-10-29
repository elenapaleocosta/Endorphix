import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { MAX_RADIUS_KM } from "@/constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { haptics } from "@/lib/haptics";
import { compactErrors, emailError, errorMessage, requiredError } from "@/lib/validation";
import { DEMO_ATHLETE, useAuthStore } from "@/store/auth.store";
import { Button, Card, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

export default function SignInScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enterApp = (user: User) => {
    setUser(user);
    haptics.success();
    router.replace("/(tabs)/discover");
  };

  const handleSignIn = async () => {
    const nextErrors = compactErrors({ email: emailError(email), password: requiredError(password, "password") });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length) {
      haptics.error();
      return;
    }

    if (!isSupabaseConfigured) {
      enterApp({ ...DEMO_ATHLETE, email: email.trim() });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profileError) throw profileError;
      enterApp(profile as unknown as User);
    } catch (err) {
      haptics.error();
      setFormError(errorMessage(err, "Sign-in failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen width="narrow">
      <PageHeader
        eyebrow="endorphix"
        title="Welcome back."
        subtitle={`Sign in to your vitality passport and find your next session within ${MAX_RADIUS_KM} km.`}
      />

      {!isSupabaseConfigured ? (
        <Card tone="paper" className="mb-6 gap-3">
          <Text className="text-sm leading-5 text-ink-muted">
            Demo mode: no backend is configured, so any email and password open the demo passport.
          </Text>
          <Button
            label="Continue with demo account"
            variant="secondary"
            size="sm"
            onPress={() => enterApp(DEMO_ATHLETE)}
          />
        </Card>
      ) : null}

      <View className="gap-4">
        <TextField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
        />

        {formError ? (
          <Text accessibilityRole="alert" className="text-sm font-medium text-terracotta">
            {formError}
          </Text>
        ) : null}

        <Button label="Sign in" onPress={handleSignIn} loading={submitting} className="mt-2" />
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-ink-muted">New to endorphix?</Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable accessibilityRole="link" className="min-h-10 justify-center px-1">
            <Text className="text-sm font-bold text-olive">Create a passport</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
