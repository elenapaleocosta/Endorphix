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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import { useAuthStore } from "@/store/auth.store";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { Colors, Spacing } from "@/constants";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { tap, success, error: errorHaptic, selection } = useHaptics();
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
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});

  const pickImageFromLibrary = async () => {
    tap();
    try {
      setIsLoadingImage(true);

      // Check / request permissions
      const { status, canAskAgain } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        setIsLoadingImage(false);
        errorHaptic();
        showAlert(
          "Photo Access Required",
          canAskAgain
            ? "Endorphix needs access to your photo library to update your Vitality avatar. Please grant photo permission."
            : "Photo library access is currently disabled. Please enable photo permissions in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch Native Picker with image restrictions & 1:1 square crop
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        selectionLimit: 1,
      });

      setIsLoadingImage(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        success();
        setAvatarUrl(selectedUri);
      }
    } catch (err: any) {
      setIsLoadingImage(false);
      errorHaptic();
      showAlert(
        "Could Not Load Image",
        "An unexpected error occurred while accessing the photo album. Please try again."
      );
    }
  };

  const handleRemoveAvatar = () => {
    selection();
    setAvatarUrl("");
  };

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
    showAlert("Profile Updated", "Your changes have been saved to your Vitality Passport.", [
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
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section with Camera Icon Overlay */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ alignItems: "center", marginBottom: 28 }}
        >
          {/* Avatar Container with Tap Handler */}
          <TouchableOpacity
            onPress={pickImageFromLibrary}
            activeOpacity={0.85}
            style={{ position: "relative", marginBottom: 12 }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: Colors.elevated,
                borderWidth: 2.5,
                borderColor: Colors.glow,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoadingImage ? (
                <ActivityIndicator color={Colors.glow} size="small" />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Text style={{ color: Colors.glow, fontSize: 36, fontWeight: "800" }}>
                  {(displayName || username || "E")[0].toUpperCase()}
                </Text>
              )}
            </View>

            {/* Camera / Edit Badge Overlay */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: Colors.glow,
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 2.5,
                borderColor: Colors.void,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.35,
                shadowRadius: 3,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 14 }}>📷</Text>
            </View>
          </TouchableOpacity>

          {/* Primary Action: Choose from Library */}
          <TouchableOpacity
            onPress={pickImageFromLibrary}
            activeOpacity={0.7}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                color: Colors.glow,
                fontSize: 13,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {isLoadingImage ? "Opening Gallery..." : "Choose from Library"}
            </Text>
          </TouchableOpacity>

          {/* Revert / Remove custom avatar if one is set */}
          {avatarUrl ? (
            <TouchableOpacity
              onPress={handleRemoveAvatar}
              activeOpacity={0.7}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: Colors.danger, fontSize: 11, fontWeight: "600" }}>
                Remove Photo · Use Default Avatar
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginBottom: 12 }} />
          )}

          {/* Preset Avatar Selection Row */}
          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            OR CHOOSE AN ATHLETE PRESET
          </Text>

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
              <Text style={{ color: Colors.tertiary, fontSize: 11, fontWeight: "700" }}>Default</Text>
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
