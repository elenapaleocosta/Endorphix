const { palette } = require("./constants/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  // The app is light-only. "class" also avoids NativeWind's web runtime throwing under the default "media" mode.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        chalk: palette.chalk,
        paper: palette.paper,
        sand: palette.sand,
        line: palette.line,
        ink: {
          DEFAULT: palette.ink,
          muted: palette.inkMuted,
          faint: palette.inkFaint,
        },
        olive: palette.olive,
        navy: palette.navy,
        terracotta: palette.terracotta,
        camel: palette.camel,
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
