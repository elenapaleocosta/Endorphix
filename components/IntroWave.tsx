import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Colors } from "@/constants";
import { haptics } from "@/lib/haptics";

/**
 * The endorphin wave as a single drawn line: a resting baseline, one crest (the high),
 * and a settle that ends above where it began. Coordinates live in a 300 × 120 box.
 */
const VIEW_W = 300;
const VIEW_H = 120;
const BASELINE_Y = 92;
const PEAK = { x: 214, y: 20 };
const WAVE_SEGMENTS: number[][] = [
  [40, BASELINE_Y, 70, 100, 108, 90],
  [150, 79, 176, PEAK.y, PEAK.x, PEAK.y],
  [246, PEAK.y, 262, 62, VIEW_W, 60],
];

/** Scales the wave into pixel space so the stroke keeps a constant weight at any size. */
function wavePath(sx: number, sy: number) {
  const pt = (x: number, y: number) => `${x * sx} ${y * sy}`;
  return WAVE_SEGMENTS.reduce(
    (d, [c1x, c1y, c2x, c2y, x, y]) => `${d} C ${pt(c1x, c1y)}, ${pt(c2x, c2y)}, ${pt(x, y)}`,
    `M ${pt(0, BASELINE_Y)}`,
  );
}

const DRAW_DELAY_MS = 350;
const DRAW_DURATION_MS = 1700;
const PEAK_RATIO = PEAK.x / VIEW_W;

interface IntroWaveProps {
  /** Rendered height; width fills the parent. */
  height?: number;
}

export function IntroWave({ height = 132 }: IntroWaveProps) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    progress.value = withDelay(
      DRAW_DELAY_MS,
      withTiming(1, { duration: DRAW_DURATION_MS, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(haptics.selection)();
      }),
    );
  }, [progress, reduceMotion, width]);

  // The line is revealed left to right by widening a clipping box, which behaves the same on native and web.
  const clipStyle = useAnimatedStyle(() => ({ width: progress.value * width }));
  const peakStyle = useAnimatedStyle(() => {
    const t = interpolate(progress.value, [PEAK_RATIO - 0.04, PEAK_RATIO + 0.06], [0, 1], "clamp");
    return { opacity: t, transform: [{ scale: 0.6 + 0.4 * t }] };
  });

  const scaleX = width / VIEW_W;
  const scaleY = height / VIEW_H;
  const dot = 9;

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel="A single line rising from rest to a peak, the endorphin high."
    >
      {width > 0 ? (
        <>
          <Svg width={width} height={height} style={{ position: "absolute" }}>
            <Line x1={0} x2={width} y1={BASELINE_Y * scaleY} y2={BASELINE_Y * scaleY} stroke={Colors.line} strokeWidth={1} />
          </Svg>
          <Animated.View style={[{ height, overflow: "hidden" }, clipStyle]}>
            <Svg width={width} height={height}>
              <Path d={wavePath(scaleX, scaleY)} fill="none" stroke={Colors.ink} strokeWidth={1.75} strokeLinecap="round" />
            </Svg>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: PEAK.x * scaleX - dot / 2,
                top: PEAK.y * scaleY - dot / 2,
                width: dot,
                height: dot,
              },
              peakStyle,
            ]}
          >
            <Svg width={dot} height={dot}>
              <Circle cx={dot / 2} cy={dot / 2} r={dot / 2} fill={Colors.terracotta} />
            </Svg>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}
