import { useRef, useState } from "react";
import { FlatList, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND_PHILOSOPHY, MAX_RADIUS_KM, SPARK_MIN_RATING } from "@/constants";
import { haptics } from "@/lib/haptics";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Button, Eyebrow } from "@/components/ui";

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  quote?: string;
}

const SLIDES: Slide[] = [
  {
    id: "movement",
    eyebrow: "The luxury of movement",
    title: "Movement is a gift.",
    body: "endorphix gets high-intensity athletes their daily dose of endorphins, at home or on the road.",
    quote: BRAND_PHILOSOPHY,
  },
  {
    id: "discover",
    eyebrow: `Within ${MAX_RADIUS_KM} km`,
    title: "From desire to action.",
    body: "Find verified venues across Water, Land and Mountain, or plan a multi-day athletic trip.",
  },
  {
    id: "spark",
    eyebrow: "The Spark",
    title: "No more choice paralysis.",
    body: `One tap surfaces a top-rated venue (${SPARK_MIN_RATING}★ and up) near you. Stop deciding, start moving.`,
  },
  {
    id: "wave",
    eyebrow: "Endorphin wave",
    title: "Feel your momentum rise.",
    body: "Thirty minutes after a session, rate your endorphin high from 1 to 100. No calorie counting.",
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const completeFTUE = useOnboardingStore((s) => s.completeFTUE);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    haptics.success();
    completeFTUE();
    router.replace("/(auth)/sign-in");
  };

  const next = () => {
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <View className="flex-1 bg-chalk" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="w-full max-w-xl flex-row items-center justify-between self-center px-6 py-3">
        <Text className="text-2xl font-extrabold text-ink">endorphix</Text>
        {!isLast ? <Button label="Skip" variant="link" onPress={finish} /> : null}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width }} className="justify-center px-6">
            <View className="w-full max-w-xl self-center">
              <Eyebrow tone="olive">{item.eyebrow}</Eyebrow>
              {item.quote ? (
                <View className="mt-4 rounded-2xl border-l-4 border-olive bg-sand p-4">
                  <Text className="text-base italic leading-6 text-ink">“{item.quote}”</Text>
                </View>
              ) : null}
              <Text accessibilityRole="header" className="mt-5 text-4xl font-extrabold text-ink">
                {item.title}
              </Text>
              <Text className="mt-3 text-base leading-6 text-ink-muted">{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View className="w-full max-w-xl flex-row items-center justify-between self-center px-6 py-4">
        <View
          accessible
          accessibilityLabel={`Step ${index + 1} of ${SLIDES.length}`}
          className="flex-row items-center gap-2"
        >
          {SLIDES.map((slide, i) => (
            <View key={slide.id} className={`h-1.5 rounded-full ${i === index ? "w-7 bg-olive" : "w-2 bg-line"}`} />
          ))}
        </View>
        <Button
          label={isLast ? "Get started" : "Continue"}
          variant={isLast ? "primary" : "secondary"}
          onPress={isLast ? finish : next}
        />
      </View>
    </View>
  );
}
