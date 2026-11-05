/**
 * Single source of truth for brand colours.
 * Consumed by tailwind.config.js (class names) and constants/index.ts (raw values
 * for SVG, Switch, ActivityIndicator and placeholder colours).
 *
 * Charcoal and steel: a dark, cool, quiet theme. Source colours are marked; every other
 * tone is generated from them. Steel is blue-grey with the violet and saturation removed.
 * Tokens are named by role, not hue. Text tones meet WCAG AA (4.5:1) on canvas, surface
 * and raised.
 */
const palette = {
  /** Source #26292B Charcoal: app background. */
  canvas: "#26292B",
  /** Source #2E3239 Slate: cards. */
  surface: "#2E3239",
  /** Slate lifted 10% toward Light Steel: inputs, secondary buttons, cards nested in a surface. */
  raised: "#3B4048",
  /** Slate lifted 28% toward Light Steel: hairlines, tracks, inactive indicators, contour lines. */
  line: "#535A62",
  /** Light Steel washed 78% toward white: primary text, cool to match the steel. */
  fg: "#EEF1F4",
  /** Text dimmed 28% toward Slate: secondary text. */
  fgMuted: "#B8BCC0",
  /** Text dimmed 36% toward Slate: tertiary text and placeholders. */
  fgFaint: "#A9ACB1",
  /** #B3C1CB Light Steel: primary actions, links and selected states (labels sit in canvas). */
  accent: "#B3C1CB",
  /** Light Steel muted 35% toward Slate: Land realm, the mid energy band, decorative marks. */
  tint: "#848F98",
  /** Light Steel: Water realm and the keyboard focus ring. */
  tintCool: "#B3C1CB",
  /** #7A92A3 Steel: the endorphin peak, Mountain realm, highlighted cards and tags. */
  highlight: "#7A92A3",
  /** Steel as the Spark button fill; its charcoal label is 4.5:1. */
  highlightStrong: "#7A92A3",
  /** Light Steel: the highlight when it is text or an icon. */
  highlightInk: "#B3C1CB",
  /** Muted rose, the one warm note, kept for errors so they never blend into the steel. */
  danger: "#E39A96",
};

module.exports = { palette };
