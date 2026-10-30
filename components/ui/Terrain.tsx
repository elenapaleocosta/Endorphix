import { memo, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants";

/**
 * Topographic contour lines drawn as a faint backdrop: two hills, one off the top-right
 * corner and one off the bottom-left, so the middle of the screen stays quiet for content.
 * Every fifth ring is an "index contour", slightly stronger, as on a real trail map.
 * The shapes are deterministic (fixed phases, no randomness) so the terrain never jumps.
 */

interface Hill {
  /** Centre as a fraction of the viewport; values outside 0–1 sit off-screen. */
  cx: number;
  cy: number;
  rings: number;
  /** Phases for the low-frequency wobble that keeps rings organic rather than circular. */
  phase: [number, number, number];
}

const HILLS: Hill[] = [
  { cx: 1.04, cy: -0.06, rings: 13, phase: [0.4, 1.9, 2.7] },
  // Kept small: on phones the content block sits low, and type shouldn't cross the lines.
  { cx: -0.1, cy: 1.06, rings: 7, phase: [2.2, 0.6, 4.1] },
];

const POINTS = 56;
const INDEX_EVERY = 5;

function ringPath(cx: number, cy: number, radius: number, ring: number, phase: Hill["phase"]) {
  // Outer rings wobble more, and each ring's phase drifts so neighbours don't stack perfectly.
  const wobble = 0.05 + ring * 0.012;
  const drift = ring * 0.22;
  const pts: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const t = (i / POINTS) * Math.PI * 2;
    const r =
      radius *
      (1 +
        wobble * Math.sin(2 * t + phase[0] + drift) +
        wobble * 0.6 * Math.sin(3 * t + phase[1] - drift) +
        wobble * 0.3 * Math.sin(5 * t + phase[2] + drift * 0.5));
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }

  // Closed Catmull-Rom spline through the points, expressed as cubic béziers.
  const p = (i: number) => pts[(i + POINTS) % POINTS];
  let d = `M ${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

/** Fills its parent behind content; place it as the first child of a full-screen container. */
export const Terrain = memo(function Terrain() {
  const { width, height } = useWindowDimensions();

  const contours = useMemo(() => {
    // Ring spacing follows the shorter side so the hills keep their proportions on phones and laptops.
    const gap = Math.max(18, Math.min(width, height) * 0.06);
    return HILLS.flatMap((hill, h) =>
      Array.from({ length: hill.rings }, (_, ring) => ({
        key: `${h}-${ring}`,
        d: ringPath(hill.cx * width, hill.cy * height, gap * (1.6 + ring), ring, hill.phase),
        index: (ring + 1) % INDEX_EVERY === 0,
      })),
    );
  }, [width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height}>
        {contours.map((c) => (
          <Path
            key={c.key}
            d={c.d}
            fill="none"
            stroke={Colors.line}
            strokeWidth={c.index ? 1.25 : 0.9}
            strokeOpacity={c.index ? 0.55 : 0.32}
          />
        ))}
      </Svg>
    </View>
  );
});
