import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { IconButton } from "./Button";

type EyebrowTone = "muted" | "olive" | "terracotta" | "navy";

const EYEBROW_TONE: Record<EyebrowTone, string> = {
  muted: "text-ink-muted",
  olive: "text-olive",
  terracotta: "text-terracotta",
  navy: "text-navy",
};

export function Eyebrow({ children, tone = "muted" }: { children: ReactNode; tone?: EyebrowTone }) {
  return (
    <Text className={`text-2xs font-display uppercase tracking-eyebrow ${EYEBROW_TONE[tone]}`}>{children}</Text>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  eyebrowTone?: EyebrowTone;
  title: string;
  subtitle?: string;
  /** Trailing element aligned with the title row (e.g. a close button). */
  accessory?: ReactNode;
  /** Renders a leading back button above the title. */
  onBack?: () => void;
}

export function PageHeader({ eyebrow, eyebrowTone = "olive", title, subtitle, accessory, onBack }: PageHeaderProps) {
  return (
    <View className="mb-6">
      {onBack ? <IconButton icon="arrow-back" accessibilityLabel="Back" onPress={onBack} className="mb-4" /> : null}
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          {eyebrow ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : null}
          <Text accessibilityRole="header" className="mt-1 text-3xl font-display text-ink">
            {title}
          </Text>
        </View>
        {accessory}
      </View>
      {subtitle ? <Text className="mt-2 text-base leading-6 text-ink-muted">{subtitle}</Text> : null}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="mb-3 min-h-10 flex-row items-center justify-between gap-3">
      <Text accessibilityRole="header" className="min-w-0 flex-1 font-display-bold text-lg text-ink" numberOfLines={2}>
        {title}
      </Text>
      {action}
    </View>
  );
}
