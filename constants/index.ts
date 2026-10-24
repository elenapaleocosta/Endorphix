// ─── endorphix Design System Constants ──────────────────────────────────────────

export const Colors = {
  // ─── Primary Earthy Luxury Palette ─────────────────────────────
  chalk:       "#EDEBE6", // Primary background (light base)
  charcoal:    "#2B1F17", // Primary background (dark / inverted mode)
  sand:        "#E0D4C1", // Card surfaces & modals (sand beige / oat)
  sandLight:   "#EBE3D5", // Elevated sand surface
  sandDark:    "#D5C8B4", // Subtle borders and dividers on light
  softChalk:   "#F5F3EF", // Crisp chalk highlights

  // ─── Primary Brand Accents ─────────────────────────────────────
  olive:       "#5A6738", // Forest Olive Green (buttons, active tabs, core headings)
  oliveLight:  "#6C7B43",
  navy:        "#22314E", // Deep Heritage Navy
  navyLight:   "#2C3F63",

  // ─── High-Impact Accent ────────────────────────────────────────
  terracotta:  "#6F2E1B", // Terracotta / Clay Rust (Spark / Live badges / High scores)
  terracottaLight: "#8B3A23",

  // ─── Secondary Tags & Sport Categories ─────────────────────────
  camel:       "#A7744B", // Camel / Warm Tan (Water, Land, Mountain)
  camelLight:  "#BD8859",

  // ─── Typography & Neutrals ─────────────────────────────────────
  espresso:    "#2B1F17", // High-contrast espresso (never pure #000000)
  espressoMuted: "#6E5F55", // Secondary body & captions
  espressoFaint: "#9B8B80", // Ghost / hint / muted borders

  // ─── Legacy & Utility Aliases ──────────────────────────────────
  obsidian:    "#2B1F17",
  void:        "#EDEBE6",
  surface:     "#E0D4C1",
  elevated:    "#EBE3D5",
  border:      "#D5C8B4",
  borderDark:  "#3E2E23",
  muted:       "#C8BAA5",

  primary:     "#2B1F17",
  secondary:   "#6E5F55",
  tertiary:    "#9B8B80",

  glow:        "#5A6738",
  spark:       "#6F2E1B",
  pulse:       "#A7744B",

  live:        "#6F2E1B",
  success:     "#5A6738",
  warning:     "#A7744B",
  danger:      "#6F2E1B",
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
  "2xl": 32,
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
    "4xl": 44,
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

export const BRAND_PHILOSOPHY =
  "The luxury of movement is a gift given to many that shall not be wasted. Running, jumping, and channeling energy throughout the body is the most effective way of getting to know yourself.";

export const ANIMATION_DURATION = {
  fast:   200,
  normal: 350,
  slow:   500,
} as const;
