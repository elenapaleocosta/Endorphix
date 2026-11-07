import { Pressable, Text, View } from "react-native";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";
import { PressableScale } from "./PressableScale";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  sublabel?: string;
  /** Small colour dot before the label (e.g. a realm accent). */
  dotColor?: string;
  /** Fill the available row space (for evenly split groups). */
  grow?: boolean;
  accessibilityLabel?: string;
}

export function Chip({ label, selected, onPress, sublabel, dotColor, grow = false, accessibilityLabel }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={`min-h-10 justify-center rounded-xl border px-3.5 py-2 ${
        selected ? "border-accent bg-accent" : "border-line bg-raised"
      } ${grow ? "flex-1 items-center" : ""}`}
    >
      <View className="flex-row items-center gap-1.5">
        {/* On a selected chip the dot sits on the accent fill, which can match it (Water), so it switches to canvas. */}
        {dotColor ? (
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: selected ? Colors.canvas : dotColor }} />
        ) : null}
        <Text numberOfLines={1} className={`text-sm font-bold ${selected ? "text-canvas" : "text-fg"}`}>
          {label}
        </Text>
      </View>
      {sublabel ? (
        <Text numberOfLines={1} className={`mt-0.5 text-2xs ${selected ? "text-canvas/80" : "text-fg-muted"}`}>
          {sublabel}
        </Text>
      ) : null}
    </PressableScale>
  );
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  /** Spoken label when the visible one is abbreviated (e.g. "1W" read as "Last 7 days"). */
  accessibilityLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-2xl border border-line bg-surface p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={`min-h-12 flex-1 items-center justify-center rounded-xl px-2 py-2 ${selected ? "bg-accent" : ""}`}
          >
            <Text numberOfLines={1} className={`text-sm font-bold ${selected ? "text-canvas" : "text-fg"}`}>
              {option.label}
            </Text>
            {option.hint ? (
              <Text numberOfLines={1} className={`text-2xs ${selected ? "text-canvas/80" : "text-fg-muted"}`}>
                {option.hint}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
