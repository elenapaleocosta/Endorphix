import { type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { Button } from "./Button";

type IconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Pulsing placeholder block. Size it with className (e.g. "h-40 w-full").
 * Pulses between two solid tones rather than fading opacity, so the backdrop never shows through.
 */
export function Skeleton({ className = "", square = false }: { className?: string; square?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`overflow-hidden bg-raised ${square ? "" : "rounded-lg"} ${className}`}
    >
      <MotiView
        style={StyleSheet.absoluteFill}
        from={{ backgroundColor: Colors.surface }}
        animate={{ backgroundColor: Colors.raised }}
        transition={{ type: "timing", duration: 800, loop: true }}
      />
    </View>
  );
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
