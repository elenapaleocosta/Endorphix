import { type ComponentProps } from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { Button } from "./Button";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Pulsing placeholder block. Size it with className (e.g. "h-40 w-full"). */
export function Skeleton({ className = "", square = false }: { className?: string; square?: boolean }) {
  return (
    <MotiView
      from={{ opacity: 0.45 }}
      animate={{ opacity: 0.9 }}
      transition={{ type: "timing", duration: 800, loop: true }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className={`bg-line ${square ? "" : "rounded-lg"} ${className}`} />
    </MotiView>
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
      <Ionicons name={icon} size={28} color={Colors.inkMuted} />
      <Text className="mt-3 text-center text-base font-bold text-ink">{title}</Text>
      {message ? <Text className="mt-1 text-center text-sm leading-5 text-ink-muted">{message}</Text> : null}
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
      className="items-center rounded-2xl border border-terracotta/30 bg-terracotta/5 px-6 py-10"
    >
      <Ionicons name="cloud-offline-outline" size={28} color={Colors.terracotta} />
      <Text className="mt-3 text-center text-base font-bold text-ink">{title}</Text>
      <Text className="mt-1 text-center text-sm leading-5 text-ink-muted">{message}</Text>
      {onRetry ? (
        <Button label="Try again" icon="refresh" onPress={onRetry} variant="secondary" size="sm" className="mt-4" />
      ) : null}
    </View>
  );
}
