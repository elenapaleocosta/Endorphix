const { palette } = require("./constants/palette");

/**
 * Opaque blend of `color` over the canvas. Used instead of `/10`-style alpha classes:
 * screens sit on a contour-line backdrop, and any translucent fill lets the lines show through.
 */
function wash(color, amount) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const base = rgb(palette.canvas);
  return `#${rgb(color)
    .map((c, i) => Math.round(base[i] + (c - base[i]) * amount).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  // The app has one (light) theme. "class" also avoids NativeWind's web runtime throwing under the default "media" mode.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: palette.canvas,
        surface: palette.surface,
        raised: palette.raised,
        line: palette.line,
        fg: {
          DEFAULT: palette.fg,
          muted: palette.fgMuted,
          faint: palette.fgFaint,
        },
        accent: palette.accent,
        tint: palette.tint,
        highlight: {
          DEFAULT: palette.highlight,
          soft: wash(palette.highlight, 0.1),
          edge: wash(palette.highlight, 0.4),
        },
        danger: {
          DEFAULT: palette.danger,
          soft: wash(palette.danger, 0.07),
          edge: wash(palette.danger, 0.4),
        },
      },
      // Brand typeface for the wordmark, headings, eyebrows and hero numbers; body text stays on the system face.
      // Each weight is its own family on native, so never combine these with font-bold/font-extrabold
      // (web would synthesise a faux bold on top).
      fontFamily: {
        display: ["Urbanist_800ExtraBold"],
        "display-bold": ["Urbanist_700Bold"],
        "display-semibold": ["Urbanist_600SemiBold"],
      },
      fontSize: {
        "2xs": ["11px", "14px"],
      },
      letterSpacing: {
        eyebrow: "1.5px",
      },
    },
  },
  plugins: [],
};
