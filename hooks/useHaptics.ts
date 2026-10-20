import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Platform } from "react-native";

/**
 * Centralised haptic feedback hook.
 * Provides named interaction types to maintain consistency across
 * the entire matte-luxury UI surface. Safely no-ops on Web.
 */
export function useHaptics() {
  const isWeb = Platform.OS === "web";

  const tap = useCallback(() => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [isWeb]);

  const confirm = useCallback(() => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [isWeb]);

  const heavy = useCallback(() => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, [isWeb]);

  const success = useCallback(() => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [isWeb]);

  const error = useCallback(() => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, [isWeb]);

  const warning = useCallback(() => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [isWeb]);

  const selection = useCallback(() => {
    if (!isWeb) Haptics.selectionAsync().catch(() => {});
  }, [isWeb]);

  return { tap, confirm, heavy, success, error, warning, selection };
}
