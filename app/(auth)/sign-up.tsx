import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { haptics } from "@/lib/haptics";
import { returnAfterAuth } from "@/lib/navigation";
import { MIN_PASSWORD_LENGTH, compactErrors, emailError, errorMessage, requiredError } from "@/lib/validation";
import { useAuthStore } from "@/store/auth.store";
import { Button, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

// Only what's needed to start. Nickname, bio and photo live in Edit profile.
type Field = "name" | "email" | "password";
type FormState = Record<Field, string>;

const EMPTY_FORM: FormState = { name: "", email: "", password: "" };

function validate(form: FormState) {
  return compactErrors({
    name: requiredError(form.name, "name"),
    email: emailError(form.email),
    password:
      form.password.length < MIN_PASSWORD_LENGTH ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : undefined,
  });
}

function splitName(name: string) {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return { first, last: rest.join(" ") || undefined };
}

function toUsername(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "athlete";
}

export default function SignUpScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Set once the account exists but the email still needs confirming. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const authParams = next ? { next } : {};

  const resend = async () => {
    if (!sentTo) return;
    setResending(true);
    setResendStatus(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: sentTo });
      if (error) throw error;
      haptics.success();
      setResendStatus({ tone: "info", text: "Sent again. It can take a minute to arrive; check spam too." });
    } catch (err) {
      haptics.error();
      setResendStatus({ tone: "error", text: errorMessage(err, "Couldn't resend the email. Please try again.") });
    } finally {
      setResending(false);
    }
  };

  const update = (field: Field) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** Checks a field as the user leaves it. Empty fields wait for submit, so tabbing past one isn't scolded. */
  const check = (field: Field) => () => {
    if (!form[field].trim()) return;
    setErrors((prev) => ({ ...prev, [field]: validate(form)[field] }));
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
    const name = form.name.trim().replace(/\s+/g, " ");
    const { first, last } = splitName(name);
    const profile: Omit<User, "id"> = {
      email: form.email.trim(),
      username: toUsername(name),
      first_name: first,
      last_name: last,
      display_name: name,
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
          last_name: profile.last_name ?? null,
        });
        if (insertError) throw insertError;

        if (!data.session) {
          haptics.success();
          setSentTo(profile.email);
          return;
        }
        id = data.user.id;
      }

      setUser({ id, ...profile });
      haptics.success();
      returnAfterAuth(router, next);
    } catch (err) {
      haptics.error();
      setNotice({ tone: "error", text: errorMessage(err, "Registration failed. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <Screen width="narrow">
        <PageHeader
          eyebrow="Almost there"
          title="Check your inbox."
          subtitle={`We sent a confirmation link to ${sentTo}. Open it, then sign in with the password you just chose.`}
        />
        <Button
          label="Go to sign in"
          size="lg"
          onPress={() => router.replace({ pathname: "/(auth)/sign-in", params: authParams })}
        />
        <View className="mt-4 items-center gap-1">
          <Button label="Resend the email" variant="link" loading={resending} onPress={resend} />
          <Button label="Use a different email" variant="link" onPress={() => setSentTo(null)} />
        </View>
        {resendStatus ? (
          <Text
            accessibilityRole="alert"
            className={`mt-2 text-center text-sm font-medium ${resendStatus.tone === "error" ? "text-danger" : "text-fg"}`}
          >
            {resendStatus.text}
          </Text>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen width="narrow">
      <PageHeader
        eyebrow="New athlete"
        title="Create your passport."
        subtitle="A few details and you're ready to find your next session."
      />

      <View className="gap-4">
        <TextField
          label="Name"
          value={form.name}
          onChangeText={update("name")}
          onBlur={check("name")}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={update("email")}
          onBlur={check("email")}
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
          onBlur={check("password")}
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
            className={`text-sm font-medium ${notice.tone === "error" ? "text-danger" : "text-fg"}`}
          >
            {notice.text}
          </Text>
        ) : null}

        <Button label="Create passport" onPress={handleSignUp} loading={submitting} className="mt-2" />
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-fg-muted">Already have a passport?</Text>
        <Link href={{ pathname: "/(auth)/sign-in", params: authParams }} replace asChild>
          <Pressable accessibilityRole="link" className="min-h-10 justify-center px-1">
            <Text className="text-sm font-bold text-accent">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
