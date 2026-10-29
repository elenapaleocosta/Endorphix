import { type ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Variant = "primary" | "spark" | "secondary" | "danger" | "link";
type Size = "lg" | "md" | "sm";

const CONTAINER: Record<Variant, string> = {
  primary: "bg-olive",
  spark: "bg-terracotta",
  secondary: "bg-paper border border-line",
  danger: "bg-paper border border-terracotta/40",
  link: "",
};

const LABEL: Record<Variant, string> = {
  primary: "text-chalk",
  spark: "text-chalk",
  secondary: "text-ink",
  danger: "text-terracotta",
  link: "text-olive",
};

const FOREGROUND: Record<Variant, string> = {
  primary: Colors.chalk,
  spark: Colors.chalk,
  secondary: Colors.ink,
  danger: Colors.terracotta,
  link: Colors.olive,
};

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
}: ButtonProps) {
  const inactive = disabled || loading;
  const sizing =
    variant === "link"
      ? "min-h-10 px-1"
      : { lg: "min-h-14 px-6 rounded-2xl", md: "min-h-12 px-5 rounded-xl", sm: "min-h-10 px-4 rounded-xl" }[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      className={`flex-row items-center justify-center gap-2 active:opacity-80 ${sizing} ${CONTAINER[variant]} ${
        inactive ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={FOREGROUND[variant]} />
      ) : icon ? (
        <Ionicons name={icon} size={size === "sm" ? 16 : 18} color={FOREGROUND[variant]} />
      ) : null}
      <Text
        numberOfLines={1}
        className={`font-bold ${{ lg: "text-lg", md: "text-base", sm: "text-sm" }[size]} ${LABEL[variant]}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  className?: string;
}

export function IconButton({ icon, accessibilityLabel, onPress, className = "" }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      className={`h-10 w-10 items-center justify-center rounded-full border border-line bg-paper active:opacity-80 ${className}`}
    >
      <Ionicons name={icon} size={20} color={Colors.ink} />
    </Pressable>
  );
}
