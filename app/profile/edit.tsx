import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useAuthStore } from "@/store/auth.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic } = useHaptics();
  const { user, updateUserProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(
    user?.display_name || user?.username || "Alex Vance"
  );
  const [username, setUsername] = useState(user?.username || "EndorphixAthlete");
  const [bio, setBio] = useState(
    user?.bio ||
      "Endurance cyclist & somatic vitality seeker. Building high-cadence momentum daily."
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});

  const validate = () => {
    const errs: { displayName?: string; username?: string } = {};
    if (!displayName.trim()) {
      errs.displayName = "Display Name cannot be blank.";
    }
    if (!username.trim()) {
      errs.username = "Username cannot be blank.";
    } else if (username.length < 3) {
      errs.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errs.username = "Only letters, numbers, and underscores allowed.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      errorHaptic();
      return;
    }
    success();
    updateUserProfile({
      display_name: displayName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
    });
    Alert.alert("Profile Updated", "Your changes have been saved to your Vitality Passport.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  const handleCancel = () => {
    tap();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      {/* Top Bar */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : 44,
          paddingHorizontal: Spacing.lg,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: Colors.void,
        }}
      >
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: Colors.secondary, fontSize: 15, fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}>
          Edit Profile
        </Text>
        <TouchableOpacity onPress={handleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: Colors.glow, fontSize: 15, fontWeight: "700" }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: 28, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ alignItems: "center", marginBottom: 32 }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: Colors.elevated,
              borderWidth: 2,
              borderColor: Colors.glow,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text style={{ color: Colors.glow, fontSize: 34, fontWeight: "800" }}>
                {(displayName || username || "E")[0].toUpperCase()}
              </Text>
            )}
          </View>

          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            SELECT AVATAR PRESET
          </Text>

          {/* Preset Avatar Selection Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                tap();
                setAvatarUrl("");
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 2,
                borderColor: avatarUrl === "" ? Colors.glow : Colors.border,
                backgroundColor: Colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: Colors.tertiary, fontSize: 12, fontWeight: "700" }}>Init</Text>
            </TouchableOpacity>

            {AVATAR_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  tap();
                  setAvatarUrl(preset);
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: avatarUrl === preset ? Colors.glow : Colors.border,
                  overflow: "hidden",
                }}
              >
                <Image source={{ uri: preset }} style={{ width: "100%", height: "100%" }} />
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        {/* Inputs */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 450, delay: 100 }}
          style={{ gap: 20 }}
        >
          {/* Display Name */}
          <View>
            <Text
              style={{
                color: Colors.tertiary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              DISPLAY NAME
            </Text>
            <TextInput
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (errors.displayName) setErrors((e) => ({ ...e, displayName: undefined }));
              }}
              placeholder="e.g. Alex Vance"
              placeholderTextColor={Colors.tertiary}
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: errors.displayName ? Colors.danger : Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.primary,
                fontSize: 15,
              }}
            />
            {errors.displayName && (
              <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>
                {errors.displayName}
              </Text>
            )}
          </View>

          {/* Username */}
          <View>
            <Text
              style={{
                color: Colors.tertiary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              ATHLETE USERNAME
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: errors.username ? Colors.danger : Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: Colors.tertiary, fontSize: 15, marginRight: 2 }}>@</Text>
              <TextInput
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="username"
                placeholderTextColor={Colors.tertiary}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  color: Colors.primary,
                  fontSize: 15,
                }}
              />
            </View>
            {errors.username && (
              <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>
                {errors.username}
              </Text>
            )}
          </View>

          {/* Bio */}
          <View>
            <Text
              style={{
                color: Colors.tertiary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              SOMATIC VITALITY BIO
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Tell other athletes about your athletic focus and momentum..."
              placeholderTextColor={Colors.tertiary}
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.primary,
                fontSize: 14,
                lineHeight: 20,
                minHeight: 100,
              }}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ marginTop: 12, gap: 12 }}>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.glow,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.void,
                  fontSize: 14,
                  fontWeight: "800",
                  letterSpacing: 1.5,
                }}
              >
                SAVE CHANGES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.8}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                backgroundColor: Colors.surface,
              }}
            >
              <Text
                style={{
                  color: Colors.secondary,
                  fontSize: 14,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
