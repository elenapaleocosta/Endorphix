import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { MAX_RADIUS_KM } from "@/constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { haptics } from "@/lib/haptics";
import { returnAfterAuth } from "@/lib/navigation";
import { compactErrors, emailError, errorMessage, requiredError } from "@/lib/validation";
import { DEMO_ATHLETE, useAuthStore } from "@/store/auth.store";
import { Button, Card, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

export default function SignInScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const setUser = useAuthStore((s) => s.setUser);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const enterApp = (user: User) => {
    setUser(user);
    haptics.success();
    returnAfterAuth(router, next);
  };

  const handleSignIn = async () => {
    const nextErrors = compactErrors({ email: emailError(email), password: requiredError(password, "password") });
    setErrors(nextErrors);
    setNotice(null);
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
      setNotice({ tone: "error", text: errorMessage(err, "Sign-in failed. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setNotice(null);
    const problem = email.trim() ? emailError(email) : "Enter your email first, then tap Forgot password.";
    if (problem) {
      setErrors((prev) => ({ ...prev, email: problem }));
      haptics.error();
      return;
    }

    if (!isSupabaseConfigured) {
      setNotice({ tone: "info", text: "Demo mode has no passwords: any email and password open the demo passport." });
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Linking.createURL("/reset-password"),
      });
      if (error) throw error;
      haptics.success();
      setNotice({
        tone: "info",
        text: `We've sent a reset link to ${email.trim()}. Open it on this device to choose a new password.`,
      });
    } catch (err) {
      haptics.error();
      setNotice({ tone: "error", text: errorMessage(err, "Couldn't send the reset link. Please try again.") });
    } finally {
      setSendingReset(false);
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
        <Card tone="raised" className="mb-6 gap-3">
          <Text className="text-sm leading-5 text-fg-muted">
            Demo mode: no backend is configured, so any email and password open the demo passport.
          </Text>
          <Button
            label="Use demo account"
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
          onBlur={() => email.trim() && setErrors((prev) => ({ ...prev, email: emailError(email) }))}
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
        <View className="-mt-2 items-end">
          <Button
            label="Forgot password?"
            variant="link"
            loading={sendingReset}
            onPress={handleForgotPassword}
          />
        </View>

        {notice ? (
          <Text
            accessibilityRole="alert"
            className={`text-sm font-medium ${notice.tone === "error" ? "text-danger" : "text-fg"}`}
          >
            {notice.text}
          </Text>
        ) : null}

        <Button label="Sign in" onPress={handleSignIn} loading={submitting} className="mt-2" />
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-fg-muted">New to endorphix?</Text>
        <Link href={{ pathname: "/(auth)/sign-up", params: next ? { next } : {} }} replace asChild>
          <Pressable accessibilityRole="link" className="min-h-10 justify-center px-1">
            <Text className="text-sm font-bold text-accent">Create a passport</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
