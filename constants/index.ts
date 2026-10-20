// ─── Design System Constants ──────────────────────────────────────────────────

export const Colors = {
  obsidian:  "#0A0A0F",
  void:      "#06060A",
  surface:   "#111118",
  elevated:  "#1A1A24",
  border:    "#1E1E2A",
  muted:     "#2A2A38",

  primary:   "#F0F0F5",
  secondary: "#8A8A9A",
  tertiary:  "#4A4A5A",

  pulse:     "#E8E0FF",
  spark:     "#C4B5FD",
  glow:      "#A78BFA",

  success:   "#34D399",
  warning:   "#FBBF24",
  danger:    "#F87171",
  live:      "#FF4757",
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const Typography = {
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    "2xl": 30,
    "3xl": 36,
  },
  weight: {
    regular:   "400" as const,
    medium:    "500" as const,
    semibold:  "600" as const,
    bold:      "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

export const MAX_RADIUS_KM = 50;
export const SPARK_MIN_RATING = 4.5;
export const ENERGY_SCALE_MIN = 1;
export const ENERGY_SCALE_MAX = 100;

export const ANIMATION_DURATION = {
  fast:   200,
  normal: 350,
  slow:   500,
} as const;
