import { type ReactNode, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Trailing content; defaults to a chevron when the row is pressable. */
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}

/** A row inside a grouped Card list. Pressable rows navigate; static rows host a control (e.g. Switch). */
export function ListRow({ title, subtitle, icon, trailing, onPress, last = false }: ListRowProps) {
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={20} color={Colors.inkMuted} /> : null}
      <View className="min-w-0 flex-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-sm leading-5 text-ink-muted">{subtitle}</Text> : null}
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.inkMuted} /> : null)}
    </>
  );

  const rowClass = `min-h-14 flex-row items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-line"}`;

  if (!onPress) return <View className={rowClass}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      className={`${rowClass} active:bg-paper`}
    >
      {content}
    </Pressable>
  );
}
