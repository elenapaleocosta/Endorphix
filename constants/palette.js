/**
 * Single source of truth for brand colours.
 * Consumed by tailwind.config.js (class names) and constants/index.ts (raw values
 * for SVG, Switch, ActivityIndicator and placeholder colours).
 *
 * Charcoal and periwinkle: a dark, cool theme. Source colours are marked; every other tone
 * is generated from them. Tokens are named by role, not hue. Text tones meet WCAG AA (4.5:1)
 * on canvas, surface and raised. Periwinkle (#5F7ADB) is a mid-tone, 2.7–3.7:1 against
 * both the charcoals and light text, so it is a fill and a mark, never a text colour or a
 * label background; the Spark button uses highlightStrong instead.
 */
const palette = {
  /** Source #26292B Charcoal: app background. */
  canvas: "#26292B",
  /** Source #2E3239 Slate: cards. */
  surface: "#2E3239",
  /** Slate lifted 10% toward Light Periwinkle: inputs, secondary buttons, cards nested in a surface. */
  raised: "#3A3F4B",
  /** Slate lifted 28% toward Light Periwinkle: hairlines, tracks, inactive indicators, contour lines. */
  line: "#4E566C",
  /** Light Periwinkle washed 78% toward white: primary text, cool to match the blues. */
  fg: "#EBEEFB",
  /** Text dimmed 28% toward Slate: secondary text. */
  fgMuted: "#B6B9C5",
  /** Text dimmed 36% toward Slate: tertiary text and placeholders. */
  fgFaint: "#A7AAB5",
  /** Source #A2B2EE Light Periwinkle: primary actions, links and selected states (labels sit in canvas). */
  accent: "#A2B2EE",
  /** Light Periwinkle muted 35% toward Slate: Land realm, the mid energy band, decorative marks. */
  tint: "#7985AF",
  /** Source Light Periwinkle: Water realm and the keyboard focus ring. */
  tintCool: "#A2B2EE",
  /** Source #5F7ADB Periwinkle: the endorphin peak, Mountain realm, highlighted cards and tags. Fills and marks only. */
  highlight: "#5F7ADB",
  /** Periwinkle deepened 25% toward Charcoal: the Spark button fill, so its light label passes AA. */
  highlightStrong: "#5166AF",
  /** Source Light Periwinkle: the highlight when it is text or an icon. */
  highlightInk: "#A2B2EE",
  /** Muted rose, the one warm note, kept for errors so they never blend into the blues. */
  danger: "#E39A96",
};

module.exports = { palette };
