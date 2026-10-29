const { palette } = require("./constants/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
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
