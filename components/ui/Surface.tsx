import { type ReactNode } from "react";
import { Text, View } from "react-native";

interface CardProps {
  children: ReactNode;
  tone?: "surface" | "raised";
  /** Terracotta outline for the single most important card on a screen. */
  accent?: boolean;
  /** No inner padding, for cards that hold full-bleed ListRows. */
  flush?: boolean;
  className?: string;
}

/** The one card surface: surface on the canvas, raised when nested inside a surface card. */
export function Card({ children, tone = "surface", accent = false, flush = false, className = "" }: CardProps) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border ${flush ? "" : "p-4"} ${accent ? "border-highlight-edge" : "border-line"} ${
        tone === "surface" ? "bg-surface" : "bg-raised"
      } ${className}`}
    >
      {children}
    </View>
  );
}

type TagTone = "neutral" | "accent" | "highlight";

const TAG_TONE: Record<TagTone, { box: string; text: string }> = {
  neutral: { box: "bg-raised border-line", text: "text-fg" },
  accent: { box: "bg-accent border-accent", text: "text-canvas" },
  highlight: { box: "bg-highlight-soft border-highlight-edge", text: "text-highlight" },
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
