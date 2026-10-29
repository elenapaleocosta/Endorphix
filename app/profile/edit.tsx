import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import { useAuthStore, DEFAULT_AVATAR } from "@/store/auth.store";
import { useHaptics } from "@/hooks/useHaptics";
import { showAlert } from "@/lib/alert";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors, Spacing } from "@/constants";

const AVATAR_PRESETS = [
  DEFAULT_AVATAR,
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

export default function EditProfileScreen() {
  const { isPhone, isTablet, isDesktop } = useResponsive();
  const router = useRouter();
  const { tap, success, error: errorHaptic, selection } = useHaptics();
  const { user, updateUserProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(
    user?.display_name ||
      (user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : "Julian Sterling")
  );
  const [username, setUsername] = useState(user?.username || "julian_sterling");
  const [bio, setBio] = useState(
    user?.bio ||
      "Country club tennis competitor & high-cadence endurance cyclist. Channeling daily endorphins within 50km."
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || DEFAULT_AVATAR);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});

  // ─── Native Media Library Photo Picker ──────────────────────────────────────
  const handlePickPhoto = async () => {
    tap();
    try {
      setIsLoadingPhoto(true);

      // 1. Request permissions with clear fallback
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setIsLoadingPhoto(false);
        errorHaptic();
        showAlert(
          "Photo Access Required",
          "endorphix requires access to your photo library to update your Vitality Passport portrait. Please enable permission in your device settings."
        );
        return;
      }

      // 2. Launch native image picker: standard formats, single-image limit, square crop
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        allowsMultipleSelection: false,
      });

      setIsLoadingPhoto(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setAvatarUrl(selectedUri);
        selection();
        showAlert(
          "Portrait Selected",
          "Your custom avatar has been loaded. Tap 'Save Changes' to commit to your Vitality Passport."
        );
      }
    } catch (err: any) {
      setIsLoadingPhoto(false);
      errorHaptic();
      showAlert("Image Selection Error", err.message || "Failed to access photo gallery.");
    }
  };

  const handleRevertDefault = () => {
    tap();
    setAvatarUrl(DEFAULT_AVATAR);
    showAlert("Avatar Reset", "Reverted to default endorphix athlete portrait.");
  };

  // ─── Validation & Save ──────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: { displayName?: string; username?: string } = {};

    if (!displayName.trim() || displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters.";
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = () => {
    if (!validateForm()) {
      errorHaptic();
      showAlert("Validation Notice", "Please correct the highlighted fields before saving.");
      return;
    }

    tap();
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const nameParts = cleanDisplayName.split(" ");
    const firstName = nameParts[0] || "Julian";
    const lastName = nameParts.slice(1).join(" ") || "Sterling";

    updateUserProfile({
      display_name: cleanDisplayName,
      first_name: firstName,
      last_name: lastName,
      username: cleanUsername,
      bio: bio.trim(),
      avatar_url: avatarUrl,
    });

    success();
    showAlert("Passport Updated", "Your athlete profile changes have been registered.");
    router.back();
  };

  const handleCancel = () => {
    tap();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 60,
          paddingTop: Platform.OS === "ios" ? 56 : 40,
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={640} noPadding>
        {/* Top Navigation Bar: Cancel & Save Changes */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: Colors.sand,
              borderWidth: 1,
              borderColor: Colors.sandDark,
            }}
          >
            <Text style={{ color: Colors.espresso, fontSize: 13, fontWeight: "700" }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text style={{ color: Colors.espresso, fontSize: 17, fontWeight: "800" }}>
            Edit Profile
          </Text>

          <TouchableOpacity
            onPress={handleSaveChanges}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: Colors.olive,
            }}
          >
            <Text style={{ color: Colors.chalk, fontSize: 13, fontWeight: "800" }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Avatar Upload & Native Photo Picker ─── */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 350 }}
          style={{
            alignItems: "center",
            marginBottom: 26,
            backgroundColor: Colors.sand,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: Colors.sandDark,
          }}
        >
          <TouchableOpacity
            onPress={handlePickPhoto}
            activeOpacity={0.85}
            style={{ position: "relative", marginBottom: 12 }}
          >
            {/* Main Avatar Preview */}
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: Colors.olive,
                backgroundColor: Colors.sandDark,
              }}
            />

            {/* Camera / Edit Icon Overlay Badge */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.charcoal,
                borderWidth: 2,
                borderColor: Colors.chalk,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoadingPhoto ? (
                <ActivityIndicator color={Colors.chalk} size="small" />
              ) : (
                <Text style={{ fontSize: 14 }}>📷</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePickPhoto} style={{ marginBottom: 6 }}>
            <Text style={{ color: Colors.olive, fontSize: 13, fontWeight: "800" }}>
              Choose from Photo Gallery ↗
            </Text>
          </TouchableOpacity>

          <Text style={{ color: Colors.espressoMuted, fontSize: 11, textAlign: "center", marginBottom: 14 }}>
            Square aspect ratio (1:1) · JPEG, PNG, or HEIC
          </Text>

          {/* Preset Choices & Revert Button */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {AVATAR_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  selection();
                  setAvatarUrl(preset);
                }}
              >
                <Image
                  source={{ uri: preset }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: avatarUrl === preset ? 2 : 1,
                    borderColor: avatarUrl === preset ? Colors.olive : Colors.sandDark,
                  }}
                />
              </TouchableOpacity>
            ))}

            {avatarUrl !== DEFAULT_AVATAR && (
              <TouchableOpacity
                onPress={handleRevertDefault}
                style={{
                  backgroundColor: Colors.softChalk,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: Colors.sandDark,
                }}
              >
                <Text style={{ color: Colors.terracotta, fontSize: 10, fontWeight: "700" }}>
                  Reset Default
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* ─── Form Inputs: Display Name, Username, Bio ─── */}
        <View style={{ gap: 16, marginBottom: 28 }}>
          {/* Display Name */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: Colors.espresso, fontSize: 11.5, fontWeight: "800", letterSpacing: 1 }}>
                DISPLAY NAME
              </Text>
              {errors.displayName && (
                <Text style={{ color: Colors.terracotta, fontSize: 11, fontWeight: "700" }}>
                  {errors.displayName}
                </Text>
              )}
            </View>
            <TextInput
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
              }}
              placeholder="e.g. Julian Sterling"
              placeholderTextColor={Colors.espressoFaint}
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.espresso,
                fontSize: 14.5,
                fontWeight: "600",
                borderWidth: 1,
                borderColor: errors.displayName ? Colors.terracotta : Colors.sandDark,
              }}
            />
          </View>

          {/* Username */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: Colors.espresso, fontSize: 11.5, fontWeight: "800", letterSpacing: 1 }}>
                PASSPORT USERNAME
              </Text>
              {errors.username && (
                <Text style={{ color: Colors.terracotta, fontSize: 11, fontWeight: "700" }}>
                  {errors.username}
                </Text>
              )}
            </View>
            <TextInput
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="e.g. julian_sterling"
              placeholderTextColor={Colors.espressoFaint}
              autoCapitalize="none"
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.espresso,
                fontSize: 14.5,
                fontWeight: "600",
                borderWidth: 1,
                borderColor: errors.username ? Colors.terracotta : Colors.sandDark,
              }}
            />
          </View>

          {/* Bio */}
          <View>
            <Text style={{ color: Colors.espresso, fontSize: 11.5, fontWeight: "800", letterSpacing: 1, marginBottom: 6 }}>
              ATHLETE BIO & CADENCE FOCUS
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Describe your athletic disciplines, cadence goals, or somatic focus."
              placeholderTextColor={Colors.espressoFaint}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.espresso,
                fontSize: 14,
                lineHeight: 20,
                borderWidth: 1,
                borderColor: Colors.sandDark,
                minHeight: 88,
              }}
            />
          </View>
        </View>

        {/* Action Button: Save Changes */}
        <TouchableOpacity
          onPress={handleSaveChanges}
          activeOpacity={0.88}
          style={{
            backgroundColor: Colors.olive,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Colors.chalk, fontSize: 14.5, fontWeight: "800", letterSpacing: 0.5 }}>
            Save Changes →
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancel}
          activeOpacity={0.85}
          style={{
            backgroundColor: Colors.sand,
            borderWidth: 1,
            borderColor: Colors.sandDark,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.espressoMuted, fontSize: 13, fontWeight: "700" }}>
            Discard & Return
          </Text>
        </TouchableOpacity>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}
