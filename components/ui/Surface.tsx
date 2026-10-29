import { type ReactNode } from "react";
import { Text, View } from "react-native";

interface CardProps {
  children: ReactNode;
  tone?: "sand" | "paper";
  /** Terracotta outline for the single most important card on a screen. */
  accent?: boolean;
  /** No inner padding, for cards that hold full-bleed ListRows. */
  flush?: boolean;
  className?: string;
}

/** The one card surface: sand on the chalk canvas, paper when nested inside a sand card. */
export function Card({ children, tone = "sand", accent = false, flush = false, className = "" }: CardProps) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border ${flush ? "" : "p-4"} ${accent ? "border-terracotta/40" : "border-line"} ${
        tone === "sand" ? "bg-sand" : "bg-paper"
      } ${className}`}
    >
      {children}
    </View>
  );
}

type TagTone = "neutral" | "olive" | "terracotta";

const TAG_TONE: Record<TagTone, { box: string; text: string }> = {
  neutral: { box: "bg-paper border-line", text: "text-ink" },
  olive: { box: "bg-olive border-olive", text: "text-chalk" },
  terracotta: { box: "bg-terracotta/10 border-terracotta/30", text: "text-terracotta" },
};

interface TagProps {
  label: string;
  tone?: TagTone;
  dotColor?: string;
}

export function Tag({ label, tone = "neutral", dotColor }: TagProps) {
  const style = TAG_TONE[tone];
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded-md border px-2 py-0.5 ${style.box}`}>
      {dotColor ? <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} /> : null}
      <Text numberOfLines={1} className={`text-2xs font-bold uppercase tracking-eyebrow ${style.text}`}>
        {label}
      </Text>
    </View>
  );
}
