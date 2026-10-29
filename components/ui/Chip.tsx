import { Pressable, Text, View } from "react-native";
import { haptics } from "@/lib/haptics";

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={`min-h-10 justify-center rounded-xl border px-3.5 py-2 active:opacity-80 ${
        selected ? "border-olive bg-olive" : "border-line bg-paper"
      } ${grow ? "flex-1 items-center" : ""}`}
    >
      <View className="flex-row items-center gap-1.5">
        {dotColor ? <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} /> : null}
        <Text numberOfLines={1} className={`text-sm font-semibold ${selected ? "text-chalk" : "text-ink"}`}>
          {label}
        </Text>
      </View>
      {sublabel ? (
        <Text numberOfLines={1} className={`mt-0.5 text-2xs ${selected ? "text-chalk/80" : "text-ink-muted"}`}>
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
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
      className="flex-row rounded-2xl border border-line bg-sand p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={`min-h-12 flex-1 items-center justify-center rounded-xl px-2 py-2 ${selected ? "bg-olive" : ""}`}
          >
            <Text numberOfLines={1} className={`text-sm font-bold ${selected ? "text-chalk" : "text-ink"}`}>
              {option.label}
            </Text>
            {option.hint ? (
              <Text numberOfLines={1} className={`text-2xs ${selected ? "text-chalk/80" : "text-ink-muted"}`}>
                {option.hint}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
