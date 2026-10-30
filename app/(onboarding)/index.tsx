import { useEffect, type ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { useOnboardingStore } from "@/store/onboarding.store";
import { IntroWave } from "@/components/IntroWave";
import { Button, Eyebrow, Terrain } from "@/components/ui";

/** Fades and lifts its children into place once, after `delay` ms. */
function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    shown.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [delay, reduceMotion, shown]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 12 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function IntroScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const completeFTUE = useOnboardingStore((s) => s.completeFTUE);

  // The wordmark is the artwork: it scales with the viewport and stays inside the column.
  const wordmarkSize = Math.round(Math.min(Math.max(width * 0.17, 52), 88));

  const enter = (href: Href) => {
    haptics.success();
    completeFTUE();
    router.replace(href);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}>
      <Terrain />
      <View className="w-full max-w-xl flex-1 self-center px-6">
        <Reveal delay={0}>
          <Eyebrow>The luxury of movement</Eyebrow>
        </Reveal>

        {/* Weighted to the lower half so the wave rises into open space, like a cover page. */}
        <View className="mb-12 mt-auto">
          <View className="-mx-6">
            <IntroWave height={Math.round(Math.min(width * 0.5, 200))} />
          </View>

          <Reveal delay={1500}>
            <Text
              accessibilityRole="header"
              className="mt-10 font-display text-fg"
              style={{ fontSize: wordmarkSize, lineHeight: wordmarkSize * 1.05, letterSpacing: -wordmarkSize * 0.04 }}
            >
              endorphix
            </Text>
          </Reveal>

          <Reveal delay={1900}>
            <Text className="mt-3 font-display-semibold text-xl leading-7 text-fg">Movement is a gift.</Text>
            <Text className="font-display-semibold text-xl leading-7 text-fg-muted">Spend it well.</Text>
          </Reveal>
        </View>

        <Reveal delay={2300}>
          <Button label="Begin" size="lg" onPress={() => enter("/(auth)/sign-up")} />
          <Pressable
            accessibilityRole="link"
            onPress={() => enter("/(auth)/sign-in")}
            className="mt-2 min-h-12 flex-row items-center justify-center gap-1"
          >
            <Text className="text-sm text-fg-muted">Already have a passport?</Text>
            <Text className="text-sm font-bold text-accent">Sign in</Text>
          </Pressable>
        </Reveal>
      </View>
    </View>
  );
}
