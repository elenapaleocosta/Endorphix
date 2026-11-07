import { type ComponentProps } from "react";
import { Pressable, type GestureResponderEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { cssInterop } from "nativewind";
import { EASE_OUT, PRESS_IN_MS, PRESS_OUT_MS, PRESS_SCALE } from "@/lib/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: "style" });

type PressableScaleProps = ComponentProps<typeof Pressable> & { className?: string };

/**
 * A Pressable that dips to 0.98 on press-in and eases back on release,
 * instead of snapping like NativeWind's `active:scale`. Runs on the UI thread.
 * Reduced motion is honoured by Reanimated's default (animations jump to their end).
 */
export function PressableScale({ onPressIn, onPressOut, style, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e: GestureResponderEvent) => {
        scale.value = withTiming(PRESS_SCALE, { duration: PRESS_IN_MS, easing: EASE_OUT });
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.value = withTiming(1, { duration: PRESS_OUT_MS, easing: EASE_OUT });
        onPressOut?.(e);
      }}
      style={[style as object, animatedStyle]}
    />
  );
}
