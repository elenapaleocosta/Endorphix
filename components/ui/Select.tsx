import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  /** null means the placeholder ("any") choice. */
  value: T | null;
  onChange: (value: T | null) => void;
  /** Label of the "any" row, shown on the trigger when nothing is chosen. */
  placeholder: string;
  accessibilityLabel: string;
}

/**
 * Tall lists scroll inside the panel instead of pushing the page down. 6.5 rows of 48px:
 * the half row peeking at the bottom shows there is more to scroll.
 */
const LIST_MAX_HEIGHT = 312;

/**
 * One quiet row that opens an inline list. Used where a long set of options (e.g. 20 sports)
 * would otherwise render as a wall of chips.
 */
export function Select<T extends string>({ options, value, onChange, placeholder, accessibilityLabel }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  const rows: { value: T | null; label: string }[] = [{ value: null, label: placeholder }, ...options];

  const choose = (next: T | null) => {
    haptics.selection();
    onChange(next);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${current?.label ?? placeholder}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          haptics.tap();
          setOpen(!open);
        }}
        className="min-h-14 flex-row items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 active:scale-[0.98]"
      >
        <Text numberOfLines={1} className={`min-w-0 flex-1 text-base font-bold ${current ? "text-fg" : "text-fg-muted"}`}>
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.fgMuted} />
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
          <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }} nestedScrollEnabled showsVerticalScrollIndicator>
            {rows.map((row, i) => {
              const selected = row.value === value;
              return (
                <Pressable
                  key={row.value ?? "__any"}
                  accessibilityRole="button"
                  accessibilityLabel={row.label}
                  accessibilityState={{ selected }}
                  onPress={() => choose(row.value)}
                  className={`min-h-12 flex-row items-center justify-between gap-3 px-4 active:bg-raised ${
                    i < rows.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <Text className={`text-base ${selected ? "font-bold text-fg" : "text-fg-muted"}`}>{row.label}</Text>
                  {selected ? <Ionicons name="checkmark" size={18} color={Colors.accent} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
