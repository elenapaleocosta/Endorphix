import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { haptics } from "@/lib/haptics";
import { MIN_PASSWORD_LENGTH, errorMessage } from "@/lib/validation";
import { useAuthStore } from "@/store/auth.store";
import { Button, EmptyState, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

type LinkState = { status: "checking" } | { status: "ready" } | { status: "invalid"; message: string };

/** Reads both the query string and the #fragment: Supabase puts recovery tokens in either, depending on flow. */
function readAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parts = url.split(/[?#]/).slice(1);
  for (const part of parts) {
    for (const pair of part.split("&")) {
      const [key, value = ""] = pair.split("=");
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
    }
  }
  return params;
}

const passwordError = (value: string) =>
  value.length < MIN_PASSWORD_LENGTH ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : undefined;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const linkedUrl = Linking.useURL();
  // On web the fragment holds the tokens; read the address bar directly so routing can't drop it.
  const url = Platform.OS === "web" && typeof window !== "undefined" ? window.location.href : linkedUrl;

  const [link, setLink] = useState<LinkState>({ status: "checking" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLink({ status: "invalid", message: "Demo mode has no passwords to reset." });
      return;
    }
    if (!url) return;

    const params = readAuthParams(url);
    if (params.error_description) {
      setLink({ status: "invalid", message: params.error_description });
      return;
    }

    let cancelled = false;
    const open = async () => {
      try {
        if (params.access_token && params.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (sessionError) throw sessionError;
        } else if (params.code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(params.code);
          if (codeError) throw codeError;
        } else {
          throw new Error("This reset link is incomplete. Request a new one from Sign in.");
        }
        if (!cancelled) setLink({ status: "ready" });
      } catch (err) {
        if (!cancelled) {
          setLink({ status: "invalid", message: errorMessage(err, "This reset link has expired. Request a new one.") });
        }
      }
    };
    open();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const save = async () => {
    const problem = passwordError(password);
    setError(problem);
    setSaveError(null);
    if (problem) {
      haptics.error();
      return;
    }

    setSaving(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();
      if (profile) setUser(profile as unknown as User);
      haptics.success();
      router.replace(profile ? "/(tabs)/discover" : "/(auth)/sign-in");
    } catch (err) {
      haptics.error();
      setSaveError(errorMessage(err, "Couldn't save your new password. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const toSignIn = () => router.replace("/(auth)/sign-in");

  return (
    <Screen width="narrow">
      <PageHeader eyebrow="endorphix" title="Choose a new password." />

      {link.status === "checking" ? (
        <Text className="text-base text-fg-muted">Checking your reset link…</Text>
      ) : link.status === "invalid" ? (
        <EmptyState
          icon="key-outline"
          title="This link can't be used"
          message={link.message}
          actionLabel="Back to sign in"
          onAction={toSignIn}
        />
      ) : (
        <View className="gap-4">
          <TextField
            label="New password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError(undefined);
            }}
            onBlur={() => password && setError(passwordError(password))}
            error={error}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={save}
          />
          {saveError ? (
            <Text accessibilityRole="alert" className="text-sm font-medium text-danger">
              {saveError}
            </Text>
          ) : null}
          <Button label="Save new password" onPress={save} loading={saving} className="mt-2" />
        </View>
      )}
    </Screen>
  );
}
