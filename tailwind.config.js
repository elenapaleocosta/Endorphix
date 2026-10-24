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
        // ─── endorphix Earthy Luxury Palette ─────────────────────
        chalk:       "#EDEBE6", // Primary background (light base)
        charcoal:    "#2B1F17", // Primary background (dark / inverted mode)
        sand:        "#E0D4C1", // Card surfaces & modals (sand beige / oat)
        sandLight:   "#EBE3D5", // Elevated sand surface
        sandDark:    "#D5C8B4", // Subtle borders and dividers on light
        softChalk:   "#F5F3EF", // Crisp chalk highlights
        
        // ─── Primary Brand Accents ───────────────────────────────
        olive:       "#5A6738", // Forest Olive Green
        oliveLight:  "#6C7B43",
        navy:        "#22314E", // Deep Heritage Navy
        navyLight:   "#2C3F63",
        
        // ─── High-Impact Accent ──────────────────────────────────
        terracotta:  "#6F2E1B", // Terracotta / Clay Rust (Spark, Live badges, High scores)
        terracottaLight: "#8B3A23",
        
        // ─── Secondary Tags & Categories ─────────────────────────
        camel:       "#A7744B", // Camel / Warm Tan (Water, Land, Mountain tags)
        camelLight:  "#BD8859",
        
        // ─── Typography & Tone ───────────────────────────────────
        espresso:    "#2B1F17", // High-contrast espresso for headings & body
        espressoMuted: "#6E5F55", // Subdued secondary text
        espressoFaint: "#9B8B80", // Tertiary / caption text
        
        // ─── Semantic Aliases (backward compatibility) ───────────
        obsidian:    "#2B1F17",
        surface:     "#E0D4C1",
        void:        "#EDEBE6",
        border:      "#D5C8B4",
        primary:     "#2B1F17",
        secondary:   "#6E5F55",
        tertiary:    "#9B8B80",
        glow:        "#5A6738",
        spark:       "#6F2E1B",
        pulse:       "#A7744B",
        live:        "#6F2E1B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
