import { Alert as RNAlert, Platform } from "react-native";

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS === "web") {
    if (!buttons || buttons.length <= 1) {
      window.alert(`${title}${message ? `\n\n${message}` : ""}`);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    } else {
      // Confirm style
      const confirmButton = buttons.find((b) => b.style !== "cancel") || buttons[buttons.length - 1];
      const cancelButton = buttons.find((b) => b.style === "cancel");
      const confirmed = window.confirm(`${title}${message ? `\n\n${message}` : ""}`);
      if (confirmed) {
        confirmButton?.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    }
  } else {
    RNAlert.alert(title, message, buttons);
  }
}
