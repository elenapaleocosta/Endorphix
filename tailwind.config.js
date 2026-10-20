/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ─── Base Palette ─────────────────────────────────────────
        obsidian:   "#0A0A0F",  // Primary background
        void:       "#06060A",  // Deeper wells, overlays
        surface:    "#111118",  // Card surfaces
        elevated:   "#1A1A24",  // Elevated cards / sheets
        border:     "#1E1E2A",  // Subtle dividers
        muted:      "#2A2A38",  // Disabled / muted surfaces

        // ─── Typography ───────────────────────────────────────────
        primary:    "#F0F0F5",  // Primary text
        secondary:  "#8A8A9A",  // Secondary / caption text
        tertiary:   "#4A4A5A",  // Ghost / placeholder text

        // ─── Accent ───────────────────────────────────────────────
        pulse:      "#E8E0FF",  // Soft lavender accent (energy)
        spark:      "#C4B5FD",  // Brighter spark highlight
        glow:       "#A78BFA",  // Active glow (live badge, CTA)

        // ─── Semantic ─────────────────────────────────────────────
        success:    "#34D399",
        warning:    "#FBBF24",
        danger:     "#F87171",

        // ─── Live Badge ───────────────────────────────────────────
        live:       "#FF4757",
      },
      fontFamily: {
        sans:       ["Inter", "system-ui", "sans-serif"],
        mono:       ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        "2xl":  "16px",
        "3xl":  "24px",
        "4xl":  "32px",
      },
    },
  },
  plugins: [],
};
