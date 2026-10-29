import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { Colors } from "@/constants";

interface TextFieldProps extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, multiline, ...inputProps },
  ref,
) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={Colors.inkFaint}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-xl border bg-paper px-4 py-3 text-base text-ink ${
          multiline ? "min-h-24" : "min-h-12"
        } ${error ? "border-terracotta" : "border-line"}`}
        {...inputProps}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" className="text-sm font-medium text-terracotta">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-sm text-ink-muted">{hint}</Text>
      ) : null}
    </View>
  );
});
