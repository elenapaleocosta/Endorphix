import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";
import { pickSquarePhoto } from "@/lib/photo";
import { showAlert } from "@/lib/alert";
import { compactErrors } from "@/lib/validation";
import { goBackOr } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button, IconButton, PageHeader, Screen, TextField } from "@/components/ui";
import type { User } from "@/types";

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  return user ? <EditProfileForm user={user} /> : null;
}

function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);

  const initial = {
    displayName: user.display_name || [user.first_name, user.last_name].filter(Boolean).join(" "),
    username: user.username,
    bio: user.bio ?? "",
    avatarUrl: user.avatar_url,
  };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});
  const [picking, setPicking] = useState(false);

  const dirty = (Object.keys(initial) as (keyof typeof initial)[]).some((key) => form[key] !== initial[key]);
  const close = () => goBackOr(router, "/(tabs)/profile");

  const update = (field: "displayName" | "username" | "bio") => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field !== "bio" && errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const choosePhoto = async () => {
    setPicking(true);
    try {
      const result = await pickSquarePhoto();
      if (result.status === "picked") setForm((prev) => ({ ...prev, avatarUrl: result.uri }));
      if (result.status === "denied") {
        showAlert("Photo access needed", "Allow photo library access in Settings to choose a profile photo.");
      }
    } finally {
      setPicking(false);
    }
  };

  const save = () => {
    const displayName = form.displayName.trim();
    const username = form.username.trim().toLowerCase();
    const nextErrors = compactErrors({
      displayName: displayName.length < 2 ? "Use at least 2 characters." : undefined,
      username: USERNAME_PATTERN.test(username) ? undefined : "3–24 lowercase letters, numbers or underscores.",
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      haptics.error();
      return;
    }

    const [firstName, ...rest] = displayName.split(/\s+/);
    updateUserProfile({
      display_name: displayName,
      first_name: firstName,
      last_name: rest.join(" ") || undefined,
      username,
      bio: form.bio.trim() || undefined,
      avatar_url: form.avatarUrl,
    });
    haptics.success();
    close();
  };

  return (
    <Screen width="narrow">
      <PageHeader
        title="Edit profile"
        accessory={<IconButton icon="close" accessibilityLabel="Discard changes" onPress={close} />}
      />

      <View className="mb-6 flex-row items-center gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose profile photo"
          onPress={choosePhoto}
          disabled={picking}
          className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-line"
        >
          {form.avatarUrl ? (
            <Image source={{ uri: form.avatarUrl }} className="h-full w-full" />
          ) : (
            <Ionicons name="camera-outline" size={28} color={Colors.fgMuted} />
          )}
        </Pressable>
        <View className="min-w-0 flex-1 items-start gap-1">
          <Button
            label={form.avatarUrl ? "Change photo" : "Add photo"}
            variant="secondary"
            size="sm"
            loading={picking}
            onPress={choosePhoto}
          />
          {form.avatarUrl ? (
            <Button
              label="Remove photo"
              variant="link"
              onPress={() => setForm((prev) => ({ ...prev, avatarUrl: undefined }))}
            />
          ) : null}
        </View>
      </View>

      <View className="gap-4">
        <TextField
          label="Display name"
          value={form.displayName}
          onChangeText={update("displayName")}
          error={errors.displayName}
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="Username"
          value={form.username}
          onChangeText={update("username")}
          error={errors.username}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
        />
        <TextField
          label="Bio"
          value={form.bio}
          onChangeText={update("bio")}
          placeholder="Your disciplines, goals or training focus"
          multiline
          maxLength={160}
          hint={`${form.bio.length}/160`}
        />
        <Button label="Save changes" onPress={save} disabled={!dirty} className="mt-2" />
      </View>
    </Screen>
  );
}
