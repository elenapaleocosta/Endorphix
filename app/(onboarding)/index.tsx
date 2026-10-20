import React, { useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  type ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useHaptics } from "@/hooks/useHaptics";
import { Colors, Spacing } from "@/constants";

const { width: SCREEN_W } = Dimensions.get("window");

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    eyebrow: "WELCOME",
    title: "Move with\nprecision.",
    subtitle:
      "Endorphix maps elite athletic facilities within 50km of wherever you stand.",
    accent: Colors.glow,
  },
  {
    id: "2",
    eyebrow: "DISCOVER",
    title: "Sport-first.\nDestination-first.",
    subtitle:
      "Search by discipline or let a destination build your perfect multi-day training tour.",
    accent: Colors.spark,
  },
  {
    id: "3",
    eyebrow: "THE SPARK",
    title: "Surprise me.",
    subtitle:
      "One tap surfaces the highest-rated venue near you and eliminates choice paralysis.",
    accent: Colors.pulse,
  },
  {
    id: "4",
    eyebrow: "ENERGY",
    title: "Feel your\nmomentum.",
    subtitle:
      "Log somatic energy on a 1–100 scale. Watch your personal wave rise over time.",
    accent: Colors.success,
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<Slide>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeFTUE, setSlide, currentSlide } = useOnboardingStore();
  const { tap, success } = useHaptics();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / SCREEN_W);
      setSlide(index);
    },
  });

  const handleNext = () => {
    tap();
    if (currentSlide < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentSlide + 1, animated: true });
      setSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    success();
    await completeFTUE();
    router.replace("/(auth)/sign-in");
  };

  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      {/* Slides */}
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        renderItem={({ item, index }: ListRenderItemInfo<Slide>) => (
          <SlideItem slide={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Pagination & CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            marginBottom: Spacing.lg,
          }}
        >
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Button */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <TouchableOpacity
            onPress={isLast ? handleGetStarted : handleNext}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.glow,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.obsidian,
                fontSize: 15,
                fontWeight: "700",
                letterSpacing: 1.5,
              }}
            >
              {isLast ? "BEGIN" : "CONTINUE"}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </View>
  );
}

// ─── Slide Item ────────────────────────────────────────────────────────────────

function SlideItem({
  slide,
  index,
  scrollX,
}: {
  slide: Slide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_W,
      index * SCREEN_W,
      (index + 1) * SCREEN_W,
    ];
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [24, 0, 24],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View
      style={[
        {
          width: SCREEN_W,
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: 120,
        },
        animStyle,
      ]}
    >
      <Text
        style={{
          color: slide.accent,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        {slide.eyebrow}
      </Text>
      <Text
        style={{
          color: Colors.primary,
          fontSize: 42,
          fontWeight: "800",
          lineHeight: 48,
          marginBottom: 20,
        }}
      >
        {slide.title}
      </Text>
      <Text
        style={{
          color: Colors.secondary,
          fontSize: 16,
          lineHeight: 26,
          maxWidth: 300,
        }}
      >
        {slide.subtitle}
      </Text>
    </Animated.View>
  );
}

// ─── Pagination Dot ────────────────────────────────────────────────────────────

function PaginationDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_W,
      index * SCREEN_W,
      (index + 1) * SCREEN_W,
    ];
    const width = interpolate(
      scrollX.value,
      inputRange,
      [6, 24, 6],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 3,
          backgroundColor: Colors.glow,
        },
        style,
      ]}
    />
  );
}
