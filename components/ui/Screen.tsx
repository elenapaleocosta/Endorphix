import { type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants";
import { Terrain } from "./Terrain";

/** Width ≥ this switches to the tablet/desktop layout (floating tab bar, multi-column grids). */
export const WIDE_BREAKPOINT = 640;
export const TAB_BAR_HEIGHT = 64;

const MAX_WIDTH = {
  narrow: "max-w-xl",
  regular: "max-w-3xl",
  wide: "max-w-6xl",
} as const;

interface ScreenProps {
  children: ReactNode;
  width?: keyof typeof MAX_WIDTH;
  /** Set on tab screens so content clears the floating tab bar on wide layouts. */
  inTabs?: boolean;
  /** Skip the top safe-area inset (e.g. iOS sheet modals that already sit below the status bar). */
  noTopInset?: boolean;
}

export function Screen({ children, width = "regular", inTabs = false, noTopInset = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const bottomClearance = inTabs
    ? windowWidth >= WIDE_BREAKPOINT
      ? TAB_BAR_HEIGHT + 32
      : 0
    : insets.bottom;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: Colors.canvas }}
    >
      {/* Fixed behind the scroll view: content glides over the terrain. */}
      <Terrain />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: (noTopInset ? 0 : insets.top) + 24,
          paddingBottom: bottomClearance + 40,
        }}
      >
        <View className={`w-full self-center px-4 sm:px-6 lg:px-8 ${MAX_WIDTH[width]}`}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
