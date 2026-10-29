import { Switch } from "react-native";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
}

// react-native-web ignores thumbColor for the "on" state and falls back to its own teal.
const webColors = { activeThumbColor: Colors.paper, activeTrackColor: Colors.olive } as object;

export function Toggle({ value, onChange, accessibilityLabel }: ToggleProps) {
  return (
    <Switch
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={(next) => {
        haptics.selection();
        onChange(next);
      }}
      trackColor={{ false: Colors.line, true: Colors.olive }}
      thumbColor={Colors.paper}
      {...webColors}
    />
  );
}
