import { type ComponentProps } from "react";
import { ActivityIndicator, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";
import { PressableScale } from "./PressableScale";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Variant = "primary" | "spark" | "secondary" | "danger" | "link";
type Size = "lg" | "md" | "sm";

const CONTAINER: Record<Variant, string> = {
  primary: "bg-accent",
  spark: "bg-highlight-strong",
  secondary: "bg-raised border border-line",
  danger: "bg-raised border border-danger-edge",
  link: "",
};

const LABEL: Record<Variant, string> = {
  primary: "text-canvas",
  spark: "text-canvas",
  secondary: "text-fg",
  danger: "text-danger",
  link: "text-accent",
};

const FOREGROUND: Record<Variant, string> = {
  primary: Colors.canvas,
  spark: Colors.canvas,
  secondary: Colors.fg,
  danger: Colors.danger,
  link: Colors.accent,
};

/**
 * Action buttons speak in the wordmark's voice: Archivo Expanded, uppercase, like lettering on kit.
 * Expanded capitals run wide, so labels sit a size below the old bold system text.
 * Links and the Spark button keep plain bold labels.
 */
const CTA_SIZE: Record<Size, string> = { lg: "text-[15px]", md: "text-[13px]", sm: "text-xs" };
const PLAIN_LABEL: Variant[] = ["link", "spark"];

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  className?: string;
  /** Fire the light tap pulse. Turn off when onPress fires its own haptic, so one action = one pulse. */
  haptic?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
  className = "",
  haptic = true,
}: ButtonProps) {
  const inactive = disabled || loading;
  // Disabled buttons get a solid muted look rather than reduced opacity, which would let the backdrop show through.
  const muted = disabled && !loading;
  const sizing =
    variant === "link"
      ? "min-h-10 px-1"
      : { lg: "min-h-14 px-6 rounded-2xl", md: "min-h-12 px-5 rounded-xl", sm: "min-h-10 px-4 rounded-xl" }[size];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        if (haptic) haptics.tap();
        onPress();
      }}
      className={`flex-row items-center justify-center gap-2 ${sizing} ${
        muted ? (variant === "link" ? "" : "border border-line bg-raised") : CONTAINER[variant]
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={FOREGROUND[variant]} />
      ) : icon ? (
        <Ionicons name={icon} size={size === "sm" ? 16 : 18} color={muted ? Colors.fgFaint : FOREGROUND[variant]} />
      ) : null}
      <Text
        numberOfLines={1}
        className={`${PLAIN_LABEL.includes(variant) ? `font-bold ${{ lg: "text-lg", md: "text-base", sm: "text-sm" }[size]}` : `uppercase tracking-cta font-wordmark ${CTA_SIZE[size]}`} ${
          muted ? "text-fg-faint" : LABEL[variant]
        }`}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  className?: string;
  /** Fire the light tap pulse. Turn off when onPress fires its own haptic. */
  haptic?: boolean;
}

export function IconButton({ icon, accessibilityLabel, onPress, className = "", haptic = true }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      onPress={() => {
        if (haptic) haptics.tap();
        onPress();
      }}
      className={`h-10 w-10 items-center justify-center rounded-full border border-line bg-raised ${className}`}
    >
      <Ionicons name={icon} size={20} color={Colors.fg} />
    </PressableScale>
  );
}
