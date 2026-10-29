import React, { type ReactNode } from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export function ResponsiveContainer({
  children,
  maxWidth,
  style,
  noPadding = false,
}: ResponsiveContainerProps) {
  const { isPhone, contentMaxWidth, gutter } = useResponsive();
  const effectiveMaxWidth = maxWidth ?? contentMaxWidth;

  return (
    <View
      style={[
        {
          width: "100%",
          maxWidth: effectiveMaxWidth,
          alignSelf: "center",
          paddingHorizontal: noPadding ? 0 : isPhone ? 16 : gutter,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
