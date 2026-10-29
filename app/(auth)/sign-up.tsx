import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { haptics } from "@/lib/haptics";
import { MIN_PASSWORD_LENGTH, compactErrors, emailError, errorMessage, requiredError } from "@/lib/validation";
import { useAuthStore } from "@/store/auth.store";
import { Button, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

type Field = "firstName" | "lastName" | "nickname" | "email" | "password";
type FormState = Record<Field, string>;

const EMPTY_FORM: FormState = { firstName: "", lastName: "", nickname: "", email: "", password: "" };

function validate(form: FormState) {
  return compactErrors({
    firstName: requiredError(form.firstName, "first name"),
    lastName: requiredError(form.lastName, "surname"),
    email: emailError(form.email),
    password:
      form.password.length < MIN_PASSWORD_LENGTH ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : undefined,
  });
}

function toUsername(form: FormState) {
  const base = form.nickname.trim() || `${form.firstName}_${form.lastName}`;
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24);
}

export default function SignUpScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: Field) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSignUp = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setNotice(null);
    if (Object.keys(nextErrors).length) {
      haptics.error();
      return;
    }

    const now = new Date().toISOString();
    const profile: Omit<User, "id"> = {
      email: form.email.trim(),
      username: toUsername(form),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      nickname: form.nickname.trim() || undefined,
      display_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      streak_current: 0,
      streak_longest: 0,
      lifetime_sessions: 0,
      created_at: now,
      updated_at: now,
    };

    setSubmitting(true);
    try {
      let id = `local-${Date.now()}`;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({ email: profile.email, password: form.password });
        if (error) throw error;
        if (!data.user) throw new Error("Registration failed. Please try again.");

        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: profile.email,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          nickname: profile.nickname ?? null,
        });
        if (insertError) throw insertError;

        if (!data.session) {
          setNotice({ tone: "info", text: "Check your inbox to confirm your email, then sign in." });
          return;
        }
        id = data.user.id;
      }

      setUser({ id, ...profile });
      haptics.success();
      router.replace("/(tabs)/discover");
    } catch (err) {
      haptics.error();
      setNotice({ tone: "error", text: errorMessage(err, "Registration failed. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen width="narrow">
      <PageHeader
        eyebrow="New athlete"
        title="Create your passport."
        subtitle="A few details and you're ready to find your next session."
      />

      <View className="gap-4">
        <View className="gap-4 sm:flex-row">
          <View className="sm:flex-1">
            <TextField
              label="First name"
              value={form.firstName}
              onChangeText={update("firstName")}
              error={errors.firstName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
            />
          </View>
          <View className="sm:flex-1">
            <TextField
              label="Surname"
              value={form.lastName}
              onChangeText={update("lastName")}
              error={errors.lastName}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
            />
          </View>
        </View>
        <TextField
          label="Nickname (optional)"
          value={form.nickname}
          onChangeText={update("nickname")}
          hint="Shown on your passport and used for your username."
          autoCapitalize="words"
          autoComplete="nickname"
          textContentType="nickname"
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={update("email")}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Password"
          value={form.password}
          onChangeText={update("password")}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSignUp}
        />

        {notice ? (
          <Text
            accessibilityRole="alert"
            className={`text-sm font-medium ${notice.tone === "error" ? "text-terracotta" : "text-ink"}`}
          >
            {notice.text}
          </Text>
        ) : null}

        <Button label="Create passport" onPress={handleSignUp} loading={submitting} className="mt-2" />
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-ink-muted">Already have a passport?</Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable accessibilityRole="link" className="min-h-10 justify-center px-1">
            <Text className="text-sm font-bold text-olive">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
