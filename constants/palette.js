/**
 * Single source of truth for brand colours.
 * Consumed by tailwind.config.js (class names) and constants/index.ts (raw values
 * for SVG, Switch, ActivityIndicator and placeholder colours).
 *
 * "Natural active trail": warm and grounded. Forest Pine ink on sand-washed paper, with
 * Rust Terracotta as the athletic highlight. Source colours are marked; every other tone is
 * generated from them. Tokens are named by role, not hue. Text tones meet WCAG AA (4.5:1)
 * on canvas and surface; amber and ochre are under 3:1, so they never carry text.
 */
const palette = {
  /** Golden Sand washed 72% toward white: app background, like the palette card's paper. */
  canvas: "#F4EDE0",
  /** Golden Sand washed 55% toward white: cards. */
  surface: "#EDE3CD",
  /** Golden Sand washed 40% toward white: inputs, secondary buttons, cards nested in a surface. */
  raised: "#E8D9BC",
  /** Golden Sand (#D8C090) blended 50% with Warm Ochre (#9E8E56): hairlines, tracks, inactive indicators. */
  line: "#BBA773",
  /** Source #1E2D1E Forest Pine: primary text. */
  fg: "#1E2D1E",
  /** Forest Pine weathered 45% toward Warm Ochre: secondary text. */
  fgMuted: "#585937",
  /** Forest Pine weathered 55% toward Warm Ochre: tertiary text and placeholders. */
  fgFaint: "#64623D",
  /** Source Forest Pine: primary actions, links and selected states (labels sit in canvas). */
  accent: "#1E2D1E",
  /** Source #C0823F Sunlit Amber: decorative marks, chart secondaries, realm dots. */
  tint: "#C0823F",
  /** Source #A04E35 Rust Terracotta: Spark, the endorphin peak, highlighted cards and tags. */
  highlight: "#A04E35",
  /** Rust deepened toward brick: errors and destructive actions only. */
  danger: "#8A3A2E",
};

module.exports = { palette };
