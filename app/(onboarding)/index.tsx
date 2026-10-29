import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  type ListRenderItemInfo,
  Platform,
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
import { Colors, Spacing, BRAND_PHILOSOPHY } from "@/constants";

interface Slide {
  id: string;
  eyebrow: string;
  quote?: string;
  title: string;
  subtitle: string;
  accent: string;
  secondaryAccent: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    eyebrow: "THE LUXURY OF MOVEMENT",
    quote: `"${BRAND_PHILOSOPHY}"`,
    title: "Movement is\na sacred gift.",
    subtitle:
      "endorphix is a refined catalyst for high-intensity athletes who need their daily dose of endorphins whether at home or traveling.",
    accent: Colors.olive,
    secondaryAccent: Colors.sand,
  },
  {
    id: "2",
    eyebrow: "50KM RADIUS PROXIMITY",
    title: "Bridging desire\nand action.",
    subtitle:
      "Dual-path discovery across Water, Land, and Mountain realms with live OpenStreetMap coordinates and Google Places data.",
    accent: Colors.navy,
    secondaryAccent: Colors.camel,
  },
  {
    id: "3",
    eyebrow: "THE SPARK ENGINE",
    title: "Eliminate choice\nparalysis.",
    subtitle:
      "A single tactile tap queries PostGIS for verified top-rated venues (4.5★+) to ignite spontaneous athletic action.",
    accent: Colors.terracotta,
    secondaryAccent: Colors.sand,
  },
  {
    id: "4",
    eyebrow: "SOMATIC ENDORPHIN WAVE",
    title: "Feel your\nmomentum rise.",
    subtitle:
      "Log your subjective Endorphin High on a 1–100 scale without calorie counting. Visualized via a matte D3/SVG wave tracking your streaks.",
    accent: Colors.olive,
    secondaryAccent: Colors.terracotta,
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<Slide>
);

export default function OnboardingScreen() {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
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

  const renderSlide = ({ item, index }: ListRenderItemInfo<Slide>) => {
    return (
      <View
        style={{
          width: SCREEN_W,
          paddingHorizontal: Spacing.xl,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 80,
        }}
      >
        <View style={{ width: "100%", maxWidth: 580 }}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 550, delay: 100 }}
        >
          {/* Eyebrow badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 24,
                height: 2,
                backgroundColor: item.accent,
              }}
            />
            <Text
              style={{
                color: item.accent,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2.5,
              }}
            >
              {item.eyebrow}
            </Text>
          </View>

          {/* Philosophy Quote Card (for Slide 1) */}
          {item.quote && (
            <View
              style={{
                backgroundColor: Colors.sand,
                borderRadius: 16,
                padding: 18,
                marginBottom: 22,
                borderLeftWidth: 3,
                borderLeftColor: Colors.olive,
              }}
            >
              <Text
                style={{
                  color: Colors.espresso,
                  fontSize: 14,
                  lineHeight: 22,
                  fontStyle: "italic",
                  fontWeight: "600",
                }}
              >
                {item.quote}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 38,
              fontWeight: "800",
              lineHeight: 44,
              letterSpacing: -1,
              marginBottom: 16,
            }}
          >
            {item.title}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 16,
              lineHeight: 24,
              fontWeight: "500",
            }}
          >
            {item.subtitle}
          </Text>
        </MotiView>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.chalk }}>
      {/* Top Brand Header */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 60 : 44,
          paddingHorizontal: Spacing.xl,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color: Colors.espresso,
            fontSize: 24,
            fontWeight: "800",
            letterSpacing: -0.5,
          }}
        >
          endorphix
        </Text>

        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={handleGetStarted}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{
                color: Colors.espressoMuted,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.5,
              }}
            >
              SKIP
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Deck */}
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      />

      {/* Bottom Navigation & Tactile Indicators */}
      <View
        style={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: Platform.OS === "ios" ? 48 : 32,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 600,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* Pagination Dots */}
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentSlide;
            return (
              <View
                key={index}
                style={{
                  width: isActive ? 28 : 8,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? Colors.olive : Colors.sandDark,
                }}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        {currentSlide === SLIDES.length - 1 ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.88}
            style={{
              backgroundColor: Colors.olive,
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: Colors.chalk,
                fontSize: 14,
                fontWeight: "800",
                letterSpacing: 0.8,
              }}
            >
              Enter endorphix →
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.88}
            style={{
              backgroundColor: Colors.sand,
              borderWidth: 1,
              borderColor: Colors.sandDark,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: Colors.espresso,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              Continue →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
