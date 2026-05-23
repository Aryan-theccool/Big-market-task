/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas:       "var(--bg-canvas)",
        surface:      "var(--bg-surface)",
        panel:        "var(--bg-panel)",
        hover:        "var(--bg-hover)",
        borderLine:   "var(--border)",
        borderFocus:  "var(--border-focus)",
        primaryText:  "var(--text-primary)",
        secondaryText:"var(--text-secondary)",
        mutedText:    "var(--text-muted)",
        gridDot:      "var(--dot-grid)",
        accent: {
          DEFAULT:    "var(--accent)",
          light:      "var(--accent-light)",
          hover:      "var(--accent-hover)",
          glow:       "var(--accent-glow)",
          rose:       "#F43F5E",
          amber:      "#F59E0B",
          sky:        "#0EA5E9",
          green:      "#22C55E",
        },
        note: {
          yellow:     "#FEF3B0",
          pink:       "#FECDD3",
          blue:       "#BFDBFE",
          green:      "#BBF7D0",
          purple:     "#DDD6FE",
          orange:     "#FED7AA",
          white:      "#FAFAF9",
        },
      },
      fontFamily: {
        display:  ["var(--font-display)", "Georgia", "serif"],
        ui:       ["var(--font-ui)", "system-ui", "sans-serif"],
        body:     ["var(--font-body)", "system-ui", "sans-serif"],
        note:     ["var(--font-note)", "cursive"],
        mono:     ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        sm:       "var(--shadow-sm)",
        md:       "var(--shadow-md)",
        lg:       "var(--shadow-lg)",
        lifted:   "var(--shadow-lifted)",
      },
      transitionTimingFunction: {
        "spring-quick":  "var(--spring-quick)",
        "spring-medium": "var(--spring-medium)",
        "spring-slow":   "var(--spring-slow)",
      },
      keyframes: {
        "marching-ants": { to: { "stroke-dashoffset": "-20" } },
        "fade-slide-up": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.97)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "spring-pop": {
          "0%":   { transform: "scale(0.85)", opacity: "0" },
          "60%":  { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-12px) scale(0.95)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "shimmer": {
          from: { "background-position": "-200% center" },
          to:   { "background-position": "200% center" },
        },
        "draw-underline": {
          from: { "stroke-dashoffset": "200" },
          to:   { "stroke-dashoffset": "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-7px)" },
        },
        "rotate-full": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "marching-ants":  "marching-ants 0.7s linear infinite",
        "fade-slide-up":  "fade-slide-up 0.22s cubic-bezier(0.16,1,0.3,1)",
        "scale-in":       "scale-in 0.18s cubic-bezier(0.16,1,0.3,1)",
        "spring-pop":     "spring-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "toast-in":       "toast-in 0.24s cubic-bezier(0.16,1,0.3,1)",
        "shimmer":        "shimmer 5s linear infinite",
        "draw-underline": "draw-underline 0.6s cubic-bezier(0.25,1,0.5,1) 0.5s forwards",
        "float":          "float 5s ease-in-out infinite",
        "spin-slow":      "rotate-full 3s linear infinite",
      },
    },
  },
  plugins: [],
};
