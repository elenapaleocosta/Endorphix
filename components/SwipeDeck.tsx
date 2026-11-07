/**
 * The Spark deck: swipe a venue right to save it to the bucket list, left to skip it.
 * Built to the animate-expo bar on Reanimated 4 and Gesture Handler 3: the card tracks the finger 1:1 on the UI thread,
 * a release commits on distance OR velocity (a flick is enough), the fly-out carries the finger's
 * velocity, an undecided drag springs back, and there is one haptic per decision.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, REALM_BY_ID } from "@/constants";
import { formatDistance, sportLabel } from "@/utils";
import { EASE_OUT } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { IconButton, Tag } from "@/components/ui";
import type { Facility } from "@/types";

export type SwipeDirection = "left" | "right";

const CARD_HEIGHT = 440;
/** How far the next card sits below the top one, so its edge peeks out and reads as a stack. */
const PEEK = 24;
/** Fraction of the card width a slow drag must cross to commit. */
const DISTANCE_COMMIT = 0.3;
/** px/s: a flick faster than this commits regardless of distance. */
const VELOCITY_COMMIT = 700;

interface SwipeDeckProps {
  venues: Facility[];
  onSwipe: (venue: Facility, direction: SwipeDirection) => void;
}

export function SwipeDeck({ venues, onSwipe }: SwipeDeckProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth - 32, 560);
  // 0 → 1 as the top card is dragged away; the card beneath rises to meet it.
  const drag = useSharedValue(0);
  const topRef = useRef<SwipeCardHandle>(null);
  const top = venues[0];

  // The card beneath was promoted to the top; the new one beneath starts from rest.
  useEffect(() => {
    drag.value = 0;
  }, [top?.id, drag]);

  const decide = (venue: Facility, direction: SwipeDirection) => {
    if (direction === "right") haptics.tap();
    else haptics.selection();
    onSwipe(venue, direction);
  };

  return (
    <View>
      <View style={{ height: CARD_HEIGHT + PEEK - CARD_HEIGHT * 0.025 }}>
        {venues
          .slice(0, 2)
          .reverse()
          .map((venue) => {
            const isTop = venue.id === top?.id;
            return (
              <SwipeCard
                key={venue.id}
                ref={isTop ? topRef : undefined}
                venue={venue}
                isTop={isTop}
                width={cardWidth}
                drag={drag}
                onDecide={(direction) => decide(venue, direction)}
              />
            );
          })}
      </View>

      {/* Buttons do exactly what the swipe does, for anyone who doesn't swipe (and mouse users on web). */}
      <View className="mt-5 flex-row items-center justify-center gap-6">
        <IconButton
          icon="close"
          accessibilityLabel="Skip this venue"
          haptic={false}
          onPress={() => topRef.current?.fling("left")}
          className="h-14 w-14"
        />
        <IconButton
          icon="bookmark-outline"
          accessibilityLabel="Save to bucket list"
          haptic={false}
          onPress={() => topRef.current?.fling("right")}
          className="h-14 w-14"
        />
      </View>
      <Text className="mt-3 text-center text-sm text-fg-faint">Swipe right to save · left to skip</Text>
    </View>
  );
}

interface SwipeCardHandle {
  fling: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  venue: Facility;
  isTop: boolean;
  width: number;
  drag: SharedValue<number>;
  onDecide: (direction: SwipeDirection) => void;
}

const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard(
  { venue, isTop, width, drag, onDecide },
  ref,
) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const offscreen = width * 1.5;

  const finish = (direction: SwipeDirection) => onDecide(direction);

  // Fly out from wherever the card is, carrying the release velocity. Clamped so it never springs back.
  const flyOut = (direction: SwipeDirection, velocityX: number) => {
    "worklet";
    const target = direction === "right" ? offscreen : -offscreen;
    drag.value = withTiming(1, { duration: 200, easing: EASE_OUT });
    x.value = withSpring(
      target,
      { velocity: velocityX, duration: 350, dampingRatio: 1, overshootClamping: true },
      (finished) => {
        if (finished) scheduleOnRN(finish, direction);
      },
    );
  };

  useImperativeHandle(ref, () => ({
    fling: (direction) => flyOut(direction, direction === "right" ? 1200 : -1200),
  }));

  const pan = usePanGesture({
    enabled: isTop,
    // Horizontal intent only: vertical drags fall through to the page scroll.
    activeOffsetX: [-12, 12],
    failOffsetY: [-14, 14],
    onUpdate: (e) => {
      "worklet";
      x.value += e.changeX;
      y.value += e.changeY * 0.2;
      drag.value = Math.min(Math.abs(x.value) / (width * DISTANCE_COMMIT), 1);
    },
    onDeactivate: (e) => {
      "worklet";
      const commitRight = x.value > width * DISTANCE_COMMIT || e.velocityX > VELOCITY_COMMIT;
      const commitLeft = x.value < -width * DISTANCE_COMMIT || e.velocityX < -VELOCITY_COMMIT;
      // A flick against the drag direction cancels, so the sign of the velocity wins over position.
      if (commitRight && e.velocityX > -VELOCITY_COMMIT) {
        flyOut("right", e.velocityX);
      } else if (commitLeft && e.velocityX < VELOCITY_COMMIT) {
        flyOut("left", e.velocityX);
      } else {
        const back = { duration: 400, dampingRatio: 0.8 };
        x.value = withSpring(0, { ...back, velocity: e.velocityX });
        y.value = withSpring(0, back);
        drag.value = withSpring(0, back);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      // Beneath: slightly smaller and lower, rising as the top card leaves.
      const t = drag.value;
      return { transform: [{ translateY: PEEK * (1 - t) }, { scale: 0.95 + 0.05 * t }] };
    }
    const rotate = interpolate(x.value, [-width, 0, width], [-8, 0, 8], Extrapolation.CLAMP);
    return { transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rotate}deg` }] };
  });

  const saveStamp = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [16, width * DISTANCE_COMMIT], [0, 1], Extrapolation.CLAMP),
  }));
  const skipStamp = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-width * DISTANCE_COMMIT, -16], [1, 0], Extrapolation.CLAMP),
  }));

  const realm = REALM_BY_ID[venue.macro_realm ?? "land"];
  const distance = formatDistance(venue.distance_meters);
  const image = venue.images[0];

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        accessible={isTop}
        // The card waiting beneath is decoration until it reaches the top.
        aria-hidden={!isTop}
        accessibilityLabel={isTop ? `${venue.name}, rated ${venue.rating.toFixed(1)}${distance ? `, ${distance} away` : ""}` : undefined}
        style={[{ position: "absolute", top: 0, alignSelf: "center", width, height: CARD_HEIGHT }, cardStyle]}
      >
        <View className="flex-1 overflow-hidden rounded-3xl border border-line bg-surface">
          {image ? (
            <Image source={{ uri: image }} resizeMode="cover" className="h-64 w-full bg-line" />
          ) : (
            <View className="h-64 w-full items-center justify-center bg-raised">
              <Ionicons name="image-outline" size={32} color={Colors.fgMuted} />
            </View>
          )}

          <View className="flex-1 p-5">
            <View className="flex-row items-center justify-between">
              <Tag label={realm.label} dotColor={realm.accent} />
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={14} color={Colors.accent} />
                <Text className="text-base font-bold text-fg">{venue.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text numberOfLines={2} className="mt-3 text-2xl font-display leading-7 text-fg">
              {venue.name}
            </Text>
            <Text numberOfLines={1} className="mt-1 text-sm text-fg-muted">
              {[distance ? `${distance} away` : null, venue.primary_sports.slice(0, 3).map(sportLabel).join(" · ")]
                .filter(Boolean)
                .join("  ·  ")}
            </Text>
          </View>
        </View>

        {/* Decision stamps: quiet, matte, and fully legible before the release commits. */}
        <Animated.View
          pointerEvents="none"
          aria-hidden
          style={[{ position: "absolute", top: 20, left: 20 }, saveStamp]}
        >
          <View className="flex-row items-center gap-1.5 rounded-full border border-accent bg-canvas px-3 py-1.5">
            <Ionicons name="bookmark" size={14} color={Colors.accent} />
            <Text className="text-xs font-display-bold uppercase tracking-eyebrow text-accent">Save</Text>
          </View>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          aria-hidden
          style={[{ position: "absolute", top: 20, right: 20 }, skipStamp]}
        >
          <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5">
            <Ionicons name="close" size={14} color={Colors.fgMuted} />
            <Text className="text-xs font-display-bold uppercase tracking-eyebrow text-fg-muted">Skip</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});
