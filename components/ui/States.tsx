import { type ComponentProps, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { Button } from "./Button";

type IconName = ComponentProps<typeof Ionicons>["name"];

const SKELETON_DELAY_MS = 300;

/**
 * Pulsing placeholder block. Size it with className (e.g. "h-40 w-full").
 * Pulses between two solid tones rather than fading opacity, so the backdrop never shows through.
 */
export function Skeleton({ className = "", square = false }: { className?: string; square?: boolean }) {
  // Hold the space but stay invisible for the first 300ms: loads faster than that never flash a placeholder.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShown(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`overflow-hidden bg-raised ${square ? "" : "rounded-lg"} ${className}`}
      style={{ opacity: shown ? 1 : 0 }}
    >
      {shown ? <SkeletonPulse /> : null}
    </View>
  );
}

/** Breathes between the surface and raised tones every 800ms, on the UI thread. */
function SkeletonPulse() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(t);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [Colors.surface, Colors.raised]),
  }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]} />;
}

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "compass-outline", title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-line px-6 py-10">
      <Ionicons name={icon} size={28} color={Colors.fgMuted} />
      <Text className="mt-3 text-center text-base font-bold text-fg">{title}</Text>
      {message ? <Text className="mt-1 text-center text-sm leading-5 text-fg-muted">{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" className="mt-4" />
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View
      accessibilityRole="alert"
      className="items-center rounded-2xl border border-danger-edge bg-danger-soft px-6 py-10"
    >
      <Ionicons name="cloud-offline-outline" size={28} color={Colors.danger} />
      <Text className="mt-3 text-center text-base font-bold text-fg">{title}</Text>
      <Text className="mt-1 text-center text-sm leading-5 text-fg-muted">{message}</Text>
      {onRetry ? (
        <Button label="Try again" icon="refresh" onPress={onRetry} variant="secondary" size="sm" className="mt-4" />
      ) : null}
    </View>
  );
}
