import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const enabled = Platform.OS !== "web";
const ignore = () => {};

/** Named haptic pulses. No-ops on web. */
export const haptics = {
  tap: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore),
  impact: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(ignore),
  selection: () => enabled && Haptics.selectionAsync().catch(ignore),
  success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  error: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore),
};
