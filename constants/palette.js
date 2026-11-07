/**
 * Single source of truth for brand colours.
 * Consumed by tailwind.config.js (class names) and constants/index.ts (raw values
 * for SVG, Switch, ActivityIndicator and placeholder colours). The splash and icon
 * background in app.config.ts and the web fallbacks in global.css repeat `canvas` and
 * `tintCool`: keep them in step when these change.
 *
 * Midnight Ice: the brief's near-black (#0A0A0F) with a blue cast, lit by a pale ice accent.
 * Deep, matte and nocturnal. Source colours are marked; every other tone is generated from
 * them. Tokens are named by role, not hue. Text tones meet WCAG AA (4.5:1) on canvas,
 * surface and raised.
 */
const palette = {
  /** Source #0B0C10 Midnight: app background, the brief's #0A0A0F with a touch of blue. */
  canvas: "#0B0C10",
  /** Midnight lifted 5% toward Ice: cards. */
  surface: "#14161C",
  /** Midnight lifted 9% toward Ice: inputs, secondary buttons, cards nested in a surface. */
  raised: "#1D2028",
  /** Midnight lifted 18% toward Ice: hairlines, tracks, inactive indicators, contour lines. */
  line: "#30343E",
  /** Ice washed toward white: primary text (16.8:1 on canvas). */
  fg: "#ECEEF2",
  /** Text dimmed toward Midnight: secondary text (7:1 on raised). */
  fgMuted: "#A6ABB6",
  /** Text dimmed further: tertiary text and placeholders (5:1 on raised). */
  fgFaint: "#8D929D",
  /** Source #C7D0DB Ice: primary actions, links and selected states (labels sit in canvas, 12.5:1). */
  accent: "#C7D0DB",
  /** Ice muted 35% toward the surface: the mid energy band and decorative marks. */
  tint: "#888F98",
  /** Ice: the keyboard focus ring. */
  tintCool: "#C7D0DB",
  /** Source #8EA3BA Glacier: the endorphin peak, highlighted cards and tags. */
  highlight: "#8EA3BA",
  /** Glacier as the Spark button fill; its midnight label is 7.5:1. */
  highlightStrong: "#8EA3BA",
  /** Pale glacier: the highlight when it is text or an icon. */
  highlightInk: "#BCC8D6",
  /** Muted rose, the one warm note, kept for errors so they never blend into the ice. */
  danger: "#E8A09B",

  /**
   * Realm colours: the one place the theme leaves the ice, so the three realms read apart at a glance
   * (realm mix bar, realm dots on chips, tags and cards). Each is at least 6:1 on surface, and they stay
   * distinguishable under deuteranopia (checked with the Machado 2009 simulation).
   */
  /** Ocean blue. */
  realmWater: "#4FA9E0",
  /** Clay-court terracotta. */
  realmLand: "#E08A4B",
  /** Alpine mint. */
  realmMountain: "#7FD49A",
};

module.exports = { palette };
