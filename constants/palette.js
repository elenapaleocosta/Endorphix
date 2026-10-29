/**
 * Single source of truth for brand colours.
 * Consumed by tailwind.config.js (class names) and constants/index.ts (raw values
 * for SVG, Switch, ActivityIndicator and placeholder colours).
 * Text tones are tuned to meet WCAG AA (4.5:1) on chalk, paper and sand.
 */
const palette = {
  chalk: "#EDEBE6",
  paper: "#F5F3EF",
  sand: "#E0D4C1",
  line: "#D5C8B4",
  ink: "#2B1F17",
  inkMuted: "#5E5047",
  inkFaint: "#7A6B60",
  olive: "#5A6738",
  navy: "#22314E",
  terracotta: "#6F2E1B",
  camel: "#A7744B",
};

module.exports = { palette };
